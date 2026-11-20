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
  return [data.reading_name, data.full_name, data.name].find(
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
  try {
    const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/auth/v1/user", {
      headers: { Authorization: "Bearer " + active.access_token, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    });
    if (!response.ok) return;
    const user = await response.json();
    const stored = read(active.user.id);
    if (user.id === active.user.id && session?.user.id === user.id && !stored?.pending &&
        stored?.name === previousName && typeof user.user_metadata?.reading_name === "string") {
      write(user.id, { name: user.user_metadata.reading_name });
    }
  } catch { /* Keep the cached account name when offline. */ }
}

export function setReadingSession(next: Session | null) {
  const previous = accountScope();
  session = next;
  initialized = true;
  const id = next?.user.id;
  if (id) {
    const existing = read(id);
    const remote = metadataName(next.user.user_metadata);
    if (!existing && remote) write(id, { name: remote });
    if (!existing?.pending && previous !== id && (existing || !remote)) void refreshName(next, existing?.name);
    void flush();
  }
  if (accountScope() !== previous) listeners.forEach(listener => listener());
}

window.addEventListener("online", () => { void flush(); });
