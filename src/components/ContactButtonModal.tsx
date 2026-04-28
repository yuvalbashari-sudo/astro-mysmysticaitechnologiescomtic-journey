import { Component, lazy, Suspense, useState, type ReactNode, type ErrorInfo } from "react";

const LeadFormModal = lazy(() => import("@/components/LeadFormModal"));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Local error boundary so a failure inside the lazy-loaded LeadFormModal
 * subtree can never blank out the host page (top bar / hero).
 */
class ModalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface the real cause in the console without crashing the page.
    // eslint-disable-next-line no-console
    console.error("[ContactButtonModal] LeadFormModal failed to render", error, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface Props {
  /**
   * Render-prop returning the trigger element. Receives an `onClick` handler
   * that opens the contact modal. The host component owns all visual styling
   * (button gradient, size, icon, animations) — this wrapper only manages
   * open/close state and the (lazy) modal mount.
   */
  children: (props: { onClick: () => void }) => ReactNode;
}

/**
 * Tiny wrapper that opens the existing protected LeadFormModal on demand.
 *
 * - LeadFormModal is lazy-loaded so its (heavy) import chain does NOT execute
 *   on initial render of host components like MysticalTopBar / MobileAiInsightOverlay.
 * - A local error boundary swallows render errors from the modal subtree so a
 *   modal-side failure can never produce a white screen on the host page.
 */
const ContactButtonModal = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  // Once the user has opened the modal at least once, we keep the lazy chunk
  // mounted so the close animation runs and re-opens are instant. Before the
  // first open we render nothing at all.
  const [mounted, setMounted] = useState(false);

  const handleOpen = () => {
    setMounted(true);
    setOpen(true);
  };

  return (
    <>
      {children({ onClick: handleOpen })}
      {mounted && (
        <ModalErrorBoundary>
          <Suspense fallback={null}>
            <LeadFormModal isOpen={open} onClose={() => setOpen(false)} mode="support" />
          </Suspense>
        </ModalErrorBoundary>
      )}
    </>
  );
};

export default ContactButtonModal;
