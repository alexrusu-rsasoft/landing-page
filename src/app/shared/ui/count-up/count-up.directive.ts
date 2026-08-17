import { Directive, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Animates the digits inside the host element's text from 0 up to their final
 * value, once, the first time the element scrolls into view. Falls back to
 * the static final text when the user prefers reduced motion.
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const el = this.elementRef.nativeElement;
    const finalText = el.textContent ?? '';
    if (!/\d/.test(finalText) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          observer = null;
          animateCountUpText(el, finalText);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    this.destroyRef.onDestroy(() => observer?.disconnect());
  }
}

const COUNT_UP_DURATION_MS = 1100;
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export function animateCountUpText(
  el: HTMLElement,
  finalText: string,
  onFrame?: (eased: number) => void,
  duration = COUNT_UP_DURATION_MS,
): void {
  const start = performance.now();

  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = easeOutCubic(progress);

    el.textContent = finalText.replace(/\d+/g, (match) => String(Math.round(Number(match) * eased)));
    onFrame?.(eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = finalText;
      onFrame?.(1);
    }
  };

  requestAnimationFrame(step);
}
