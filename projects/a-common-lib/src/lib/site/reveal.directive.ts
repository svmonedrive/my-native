import { DestroyRef, Directive, DOCUMENT, ElementRef, inject } from '@angular/core';
import { prefersReducedMotion } from './scroll';

/** Fades an element in (and lifts it slightly) the first time it scrolls into view. */
@Directive({ selector: '[libReveal]' })
export class RevealDirective {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const win = inject(DOCUMENT).defaultView;
    if (!win || prefersReducedMotion(win) || typeof IntersectionObserver === 'undefined') return;

    const ease = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.7s ${ease}, transform 0.7s ${ease}`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
