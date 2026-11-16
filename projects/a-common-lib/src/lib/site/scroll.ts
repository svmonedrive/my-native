/** True when the user asked the OS/browser for less motion. */
export function prefersReducedMotion(win: Window | null): boolean {
  return !!win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Smooth-scrolls to the element with `id` (sections use `scroll-margin-top` to clear the fixed header). */
export function scrollToSection(doc: Document, id: string): void {
  const win = doc.defaultView;
  doc.getElementById(id)?.scrollIntoView({
    behavior: prefersReducedMotion(win) ? 'auto' : 'smooth',
    block: 'start',
  });
}

export function scrollToTop(doc: Document): void {
  const win = doc.defaultView;
  win?.scrollTo({ top: 0, behavior: prefersReducedMotion(win) ? 'auto' : 'smooth' });
}
