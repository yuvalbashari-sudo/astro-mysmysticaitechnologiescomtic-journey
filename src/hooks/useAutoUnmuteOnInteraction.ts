import { useEffect } from "react";
import type { RefObject } from "react";
import { hasUserInteracted } from "@/lib/userInteraction";

/**
 * Auto-unmutes a <video> element after the first user interaction anywhere
 * on the page. Safe across Chrome/Safari/iOS/Android: if unmuted playback is
 * rejected, falls back to muted playback so autoplay continues.
 *
 * Pass `enabled={false}` for purely decorative/silent loops where you want to
 * keep them muted regardless.
 */
export function useAutoUnmuteOnInteraction(
  ref: RefObject<HTMLVideoElement>,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return;
    const v = ref.current;
    if (!v) return;

    const tryUnmute = () => {
      const el = ref.current;
      if (!el) return;
      if (!el.muted) return;
      el.muted = false;
      el.volume = 1;
      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay with sound rejected — restore muted autoplay.
          el.muted = true;
          el.play().catch(() => {});
        });
      }
    };

    // If user has already interacted before this video mounted, unmute now.
    if (hasUserInteracted()) {
      // Defer so the element has a chance to start playing muted first.
      const id = window.setTimeout(tryUnmute, 0);
      return () => window.clearTimeout(id);
    }

    const onGesture = () => {
      tryUnmute();
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
      window.removeEventListener("touchstart", onGesture, true);
      window.removeEventListener("click", onGesture, true);
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener("pointerdown", onGesture, opts);
    window.addEventListener("keydown", onGesture, opts);
    window.addEventListener("touchstart", onGesture, opts);
    window.addEventListener("click", onGesture, opts);

    return () => {
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
      window.removeEventListener("touchstart", onGesture, true);
      window.removeEventListener("click", onGesture, true);
    };
  }, [ref, enabled]);
}
