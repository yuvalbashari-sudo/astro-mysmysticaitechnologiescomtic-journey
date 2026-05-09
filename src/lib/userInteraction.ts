/**
 * Tracks whether the user has interacted with the page in any meaningful way.
 * Used to decide whether videos can autoplay with sound (browsers require a
 * prior user gesture before allowing unmuted autoplay).
 */

const STORAGE_KEY = "user_has_interacted";
let interacted = false;
let listenersAttached = false;

const readPersisted = (): boolean => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const persist = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
};

export const hasUserInteracted = (): boolean => {
  if (interacted) return true;
  if (typeof window === "undefined") return false;
  if (readPersisted()) {
    interacted = true;
    return true;
  }
  return false;
};

export const markUserInteracted = () => {
  if (interacted) return;
  interacted = true;
  persist();
};

/**
 * Attach global listeners (idempotent) that flip the interacted flag on the
 * first real user gesture: pointerdown, keydown, or touchstart.
 */
export const initUserInteractionTracking = () => {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;

  const onGesture = () => {
    markUserInteracted();
  };

  const opts: AddEventListenerOptions = { once: true, passive: true, capture: true };
  window.addEventListener("pointerdown", onGesture, opts);
  window.addEventListener("keydown", onGesture, opts);
  window.addEventListener("touchstart", onGesture, opts);
  window.addEventListener("click", onGesture, opts);
};
