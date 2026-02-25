/**
 * Google Analytics (gtag.js) helpers for SPA page view tracking.
 * The gtag script is loaded in index.html.
 */

export const GA_MEASUREMENT_ID = 'G-075VBYZDZN'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Send a page_view for the given path (call on route change). */
export function sendPageView(path: string): void {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: path })
  }
}
