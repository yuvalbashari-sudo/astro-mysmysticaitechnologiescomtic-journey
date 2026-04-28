## Goal
Make the green floating contact button open the existing protected `LeadFormModal` instead of opening WhatsApp, on both the mobile hero overlay and the desktop top bar. No layout, copy, translation, backend, or credential changes.

## Verified facts from the codebase
- `src/components/LeadFormModal.tsx` exports `default LeadFormModal` with props `{ isOpen, onClose, preselectedInterest? }`. It already:
  - Inserts into `leads` table
  - Sends `support-new-lead` template to `support@myastrologai.com` via `send-transactional-email` edge function
  - Uses honeypot (`website_url`), `antiAbuse` cooldown / rate-limit / duplicate / timing checks
- Existing working usage pattern across the project: `<LeadFormModal isOpen={...} onClose={() => ...} />` (e.g. matches the `isOpen`/`onClose` pattern used by all sibling modals).
- Two green contact buttons currently call WhatsApp:
  1. `src/components/MysticalTopBar.tsx` (desktop/tablet) — `whatsappBtn` using `whatsappUrl`
  2. `src/components/MobileAiInsightOverlay.tsx` lines ~336–349 (mobile hero) — inline `<button onClick={() => window.open("https://wa.me/972500000000", ...)}>`
- The standalone `src/components/WhatsAppFloatingButton.tsx` is already disabled (`return null;`) — no change needed.
- Result-sharing WhatsApp links (ShareResultSection, RisingSignModal, TarotModal, etc.) are out of scope and will not be touched.

## Changes (surgical, 2 files)

### 1) `src/components/MysticalTopBar.tsx`
- Add import: `import LeadFormModal from "@/components/LeadFormModal";`
- Add state: `const [contactOpen, setContactOpen] = useState(false);`
- Remove the `whatsappUrl` constant.
- Change `whatsappBtn` `onClick` from `window.open(whatsappUrl, ...)` to `() => setContactOpen(true)`.
- Wrap the returned `<motion.header>` in a fragment and append `<LeadFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />` after the header.
- Keep button class names, gradient style, box-shadow, sizes, `MessageCircle` icon, animations, and `aria-label` exactly as-is.

### 2) `src/components/MobileAiInsightOverlay.tsx`
- Add state: `const [contactOpen, setContactOpen] = useState(false);`
- Already imports `LeadFormModal`? No — add: `import LeadFormModal from "@/components/LeadFormModal";`
- Change the green `<button>` (lines ~336–349) `onClick` from `window.open("https://wa.me/972500000000", ...)` to `() => setContactOpen(true)`.
- Render `<LeadFormModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />` alongside the existing `<AdvisorChatPanel>` / `<MobileOptionsSheet>` near the top of the returned JSX (line ~142).
- Keep the button's size, gradient, box-shadow, `MessageCircle` icon, and `aria-label` unchanged.

## Out of scope (will NOT change)
- WhatsApp share links inside ShareResultSection, RisingSignModal, MonthlyForecastModal, TarotModal, TarotWorldModal, FooterCTA, LeadSection, AccessibilityStatement, ZodiacSignPage, TarotCardPage.
- Translation strings (`hero_cta_whatsapp`, `lead_whatsapp`, etc.) — only the button behavior changes; the labels remain.
- Backend, edge functions, M365 credentials, RLS, or `support-new-lead` template.
- Page layout, hero composition, or any other component.

## Verification after implementation
- Run a quick `rg` to confirm no green-button onClick still uses `wa.me` / `api.whatsapp.com`.
- Confirm the preview at `/` renders without a blank screen.
- Confirm clicking the green button on both mobile and desktop opens the existing `LeadFormModal` (CinematicModalShell with the form), and does not navigate away.

## Rollback plan
If integrating `LeadFormModal` into either file produces a render error or blank preview, revert that single file's button onClick back to the previous `window.open(...)` WhatsApp URL and remove the added state/import — restoring the working preview without touching anything else.