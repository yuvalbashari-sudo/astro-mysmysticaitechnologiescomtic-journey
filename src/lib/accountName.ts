import type { Session } from "@supabase/supabase-js";

type StoredName = { name: string; pending?: boolean };

let session: Session | null = null;
let initialized = false;
const listeners = new Set<() => void>();
const saving = new Map<string, Promise<void>>();

export function accountScope() {
  return session?.user.id || (initialized ? "guest" : "loading");
}

export function subscribeAccount(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function accountStorageKey(base: string) {
  return session?.user.id ? base + ":" + session.user.id : base;
}

const resetKey = "astrologai_profile_reset";

export function profileRevision() {
  return localStorage.getItem(accountStorageKey(resetKey)) || "";
}

function applyReset(stamp: number) {
  if (!Number.isSafeInteger(stamp) || stamp <= Number(profileRevision())) return;
  for (const base of ["astrologai_mystical_profile", "astrologai_birthchart_cache", "astrologai_last_daily_horoscope", "astrologai_device_fp", "astrologai_private_horoscope_token"]) {
    localStorage.removeItem(accountStorageKey(base));
  }
  sessionStorage.removeItem(accountStorageKey("astrologai_tarot_session"));
  localStorage.setItem(accountStorageKey(resetKey), String(stamp));
  if (session) write(session.user.id, { name: "" });
  listeners.forEach(listener => listener());
}

export async function resetReadingProfile() {
  if (!initialized) throw new Error("Account is loading");
  const owner = session;
  const stamp = Math.max(Date.now(), Number(profileRevision()) + 1);
  if (owner) {
    await saving.get(owner.user.id);
    if (owner.user.id !== session?.user.id) throw new Error("Account changed");
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/auth/v1/user", {
      method: "PUT",
      headers: { Authorization: "Bearer " + session.access_token, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ data: { reading_name: "", reading_profile_reset: stamp } }),
    });
    if (!response.ok || owner.user.id !== session?.user.id) throw new Error("Reset not confirmed");
  }
  applyReset(stamp);
}

function read(id: string): StoredName | null {
  try { return JSON.parse(localStorage.getItem("astrologai_name:" + id) || "null"); }
  catch { return null; }
}

function write(id: string, entry: StoredName) {
  const previous = read(id)?.name;
  localStorage.setItem("astrologai_name:" + id, JSON.stringify(entry));
  if (previous !== entry.name && id === session?.user.id) listeners.forEach(listener => listener());
}

function metadataName(data: Record<string, unknown> = {}) {
  if (typeof data.reading_name === "string") return data.reading_name.trim().slice(0, 100);
  return [data.full_name, data.name].find(
    (value): value is string => typeof value === "string" && !!value.trim(),
  )?.trim().slice(0, 100);
}

export function accountReadingName() {
  if (!session?.user.id) return undefined;
  const stored = read(session.user.id);
  return stored ? stored.name : metadataName(session.user.user_metadata);
}

function flush() {
  const id = session?.user.id;
  if (!id || !read(id)?.pending) return Promise.resolve();
  const running = saving.get(id);
  if (running) return running;
  const job = sendPendingName(id).finally(() => saving.delete(id));
  saving.set(id, job);
  return job;
}

async function sendPendingName(id: string) {
  try {
    while (session?.user.id === id) {
      const entry = read(id);
      if (!entry?.pending) break;
      // Bind each write to its owner's token even if the browser changes accounts mid-request.
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/auth/v1/user", {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + session.access_token,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { reading_name: entry.name } }),
      });
      if (!response.ok) break;
      if (read(id)?.name === entry.name) write(id, { name: entry.name });
    }
  } catch { /* The saved entry remains pending until reconnection. */ }
}

export async function rememberAccountName(name: string) {
  const id = session?.user.id;
  if (!id) return false;
  if (accountReadingName() !== name.trim()) write(id, { name: name.trim(), pending: true });
  await flush();
  return session?.user.id === id && accountReadingName() === name.trim() && !read(id)?.pending;
}

async function refreshName(active: Session, previousName?: string) {
  const initialRevision = profileRevision();
  try {
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/auth/v1/user", {
      headers: { Authorization: "Bearer " + active.access_token, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) return false;
    const user = await response.json();
    if (user.id !== active.user.id || session?.user.id !== user.id) return false;
    const revision = user.user_metadata?.reading_profile_reset;
    if (Number.isSafeInteger(revision) && revision > Number(profileRevision())) {
      applyReset(revision);
      if (typeof user.user_metadata.reading_name === "string") write(user.id, { name: user.user_metadata.reading_name });
      return true;
    }
    if (initialRevision !== profileRevision() || Number(revision || 0) < Number(profileRevision())) return false;
    const stored = read(active.user.id);
    if (user.id === active.user.id && session?.user.id === user.id && !stored?.pending &&
        stored?.name === previousName && typeof user.user_metadata?.reading_name === "string") {
      write(user.id, { name: user.user_metadata.reading_name });
    }
    return true;
  } catch { return false; }
}

export function setReadingSession(next: Session | null) {
  const previous = accountScope();
  session = next;
  initialized = true;
  const id = next?.user.id;
  if (id) {
    const tokenReset = next.user.user_metadata?.reading_profile_reset;
    if (Number.isSafeInteger(tokenReset) && tokenReset > Number(profileRevision())) {
      applyReset(tokenReset);
      if (typeof next.user.user_metadata.reading_name === "string") write(id, { name: next.user.user_metadata.reading_name });
    }
    const existing = read(id);
    const remote = metadataName(next.user.user_metadata);
    if (!existing && remote) write(id, { name: remote });
    if (previous !== id || read(id)?.pending) reconcile();
  }
  if (accountScope() !== previous) listeners.forEach(listener => listener());
}

function reconcile() {
  const owner = session;
  if (!owner) return;
  void refreshName(owner, read(owner.user.id)?.name).then(current => {
    if (current && session?.user.id === owner.user.id) void flush();
  });
}
window.addEventListener("online", reconcile);
window.addEventListener("focus", reconcile);
window.addEventListener("storage", event => {
  if (event.key === accountStorageKey(resetKey)) {
    sessionStorage.removeItem(accountStorageKey("astrologai_tarot_session"));
    listeners.forEach(listener => listener());
  }
});
