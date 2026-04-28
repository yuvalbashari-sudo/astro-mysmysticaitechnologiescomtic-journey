## Diagnosis

I inspected the two changed files and the supporting modules:

- `src/components/MysticalTopBar.tsx` — adds `useState(contactOpen)` and renders `<LeadFormModal isOpen={contactOpen} onClose=... />` next to the header inside a fragment.
- `src/components/MobileAiInsightOverlay.tsx` — same pattern.
- `src/components/LeadFormModal.tsx` — uses `CinematicModalShell`, `useT`, `antiAbuse`, `supabase`, `toast`. All imports resolve. Default export is correct.
- `src/components/CinematicModalShell.tsx` — calls `useReadingContext()` unconditionally before the `if (!isOpen) return null` guard. `ReadingProvider` does wrap the whole app in `App.tsx`, so this is fine.
- All translation keys (`lead_*`, `a11y_whatsapp_contact`) exist in `src/i18n/types.ts` and `src/i18n/translations/*`.
- `antiAbuse.createTimingCheck`, `fullCheck`, etc. all exist.

On paper the code is correct and `<LeadFormModal isOpen={false} />` should render `null` and never crash. The most likely remaining cause of the blank screen is a subtle runtime issue introduced by mounting `LeadFormModal` (which transitively imports `CinematicModalShell` → `AdvisorChatPanel` and other heavy modules) inside the **always-rendered** top bar / mobile hero. Possibilities:
1. A circular import created when `MysticalTopBar` (rendered very early) pulls in `LeadFormModal` → `CinematicModalShell` → `AdvisorChatPanel`, which itself may re-import something already in the top-bar chain.
2. An error thrown deep in one of those modules at module-evaluation time on the homepage that wasn't visible before because `LeadFormModal` was never imported anywhere.

## Fix Strategy (surgical, no UI/UX changes)

Isolate the contact-modal behavior into a tiny wrapper component so that:
- The heavy `LeadFormModal` import chain does not load on initial render of `MysticalTopBar` / `MobileAiInsightOverlay`.
- If the modal subtree throws, it cannot blank the whole page.

### Steps

1. **Create `src/components/ContactButtonModal.tsx`** — a tiny self-contained wrapper that:
   - Accepts `children` render-prop or `className`/`aria-label` props plus a trigger element.
   - Holds its own `useState` for open/close.
   - **Lazy-loads** `LeadFormModal` via `React.lazy` + `Suspense` (so the heavy chain only loads when the user clicks).
   - Wraps the modal in a small error boundary that swallows render errors so a modal failure can never blank the page.

2. **`MysticalTopBar.tsx`**:
   - Remove the top-level `LeadFormModal` import and `contactOpen` state.
   - Remove the trailing `<LeadFormModal ... />` mount and the wrapping fragment.
   - Replace the `whatsappBtn` button body with `<ContactButtonModal>` rendering the same green `motion.button` exactly as it is today (same gradient, size, icon, aria-label, hover/tap animations).

3. **`MobileAiInsightOverlay.tsx`**:
   - Remove the `LeadFormModal` import, the `contactOpen` state, and the `<LeadFormModal ... />` mount.
   - Replace the existing in-line green contact `<button>` with `<ContactButtonModal>` rendering the same button markup unchanged.

4. **Verify**:
   - Preview renders normally (no white screen).
   - Clicking either green button opens the existing `LeadFormModal` (same form, same `support-new-lead` route to `support@myastrologai.com`, same anti-spam, same email-not-shown-as-text guarantee).
   - WhatsApp is not opened anywhere from these buttons.
   - No layout, copy, color, animation, or backend change.

### What stays untouched

- Button visual design, position, size, color, icon, aria-label, animations.
- All translations and copy.
- `LeadFormModal.tsx` itself and its server-side flow (`send-transactional-email` → `support-new-lead` → `support@myastrologai.com`).
- Microsoft 365 credentials and edge-function code.
- `WhatsAppFloatingButton.tsx` (already returns `null`; left as-is).
- All other unrelated files.

### Rollback safety

If the wrapper still produces a blank screen after the change, the error boundary inside `ContactButtonModal` will let the rest of the page render while logging the underlying error to the console, so we can pinpoint the real cause without leaving the user with a white page.
