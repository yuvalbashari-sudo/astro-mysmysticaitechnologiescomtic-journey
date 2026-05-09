import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HE_ORIGIN = "https://myastrologai.com";
const US_ORIGIN = "https://us.myastrologai.com";

const HREFLANG_MAP: Array<{ hreflang: string; origin: string }> = [
  { hreflang: "he-IL", origin: HE_ORIGIN },
  { hreflang: "en-US", origin: US_ORIGIN },
  { hreflang: "x-default", origin: HE_ORIGIN },
];

const MANAGED_ATTR = "data-managed-hreflang";

function upsertLink(rel: string, hreflang: string | null, href: string) {
  const selector = hreflang
    ? `link[${MANAGED_ATTR}][rel="${rel}"][hreflang="${hreflang}"]`
    : `link[${MANAGED_ATTR}][rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute(MANAGED_ATTR, "true");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Globally injects hreflang alternates and a per-host canonical tag for SEO.
 * - he-IL → https://myastrologai.com<path>
 * - en-US → https://us.myastrologai.com<path>
 * - x-default → https://myastrologai.com<path>
 * - canonical → current host + path (Hebrew pages canonicalize to HE, US to US)
 */
export function useHreflangTags() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = `${pathname}${search || ""}`;

    // Remove any unmanaged canonicals that could conflict
    document.head
      .querySelectorAll<HTMLLinkElement>('link[rel="canonical"]:not([data-managed-hreflang])')
      .forEach((el) => el.remove());

    // hreflang alternates
    HREFLANG_MAP.forEach(({ hreflang, origin }) => {
      upsertLink("alternate", hreflang, `${origin}${path}`);
    });

    // canonical for current host (fallback to HE origin if host unknown)
    const host = typeof window !== "undefined" ? window.location.host : "";
    const isUS = host.startsWith("us.");
    const canonicalOrigin = isUS ? US_ORIGIN : HE_ORIGIN;
    upsertLink("canonical", null, `${canonicalOrigin}${path}`);
  }, [pathname, search]);
}
