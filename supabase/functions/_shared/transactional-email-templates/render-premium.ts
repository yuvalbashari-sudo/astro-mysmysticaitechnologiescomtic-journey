import type { ReactElement } from 'npm:react@18.3.1'
import { renderToStaticMarkup } from 'npm:react-dom@18.3.1/server'

export function isPremiumTemplate(name: string) {
  return name === 'premium-confirmation' || name === 'premium-new-lead'
}

// These templates are synchronous. Rendering one Unicode string avoids splitting
// a Hebrew character between byte chunks in the legacy React Email renderer.
export function renderPremiumHtml(element: ReactElement): string {
  return '<!doctype html>' + renderToStaticMarkup(element)
}
