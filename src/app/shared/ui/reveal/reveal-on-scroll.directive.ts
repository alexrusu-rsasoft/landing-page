import { Directive, DestroyRef, ElementRef, afterNextRender, inject, input, Renderer2 } from '@angular/core';

/**
 * Fades a section into place the first time it scrolls into view: slides up
 * by default, or in from the right with `direction="right"`. Falls back to
 * fully visible immediately when the user prefers reduced motion.
 */
@Directive({
  selector: '[appRevealOnScroll]',
  host: {
    '[class.reveal-on-scroll]': "direction() !== 'right'",
    '[class.reveal-on-scroll-right]': "direction() === 'right'",
  },
})
export class RevealOnScrollDirective {
  readonly direction = input<'up' | 'right'>('up');

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const el = this.elementRef.nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.renderer.addClass(el, 'is-visible');
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.renderer.addClass(el, 'is-visible');
          observer?.disconnect();
          observer = null;
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' },
    );
    observer.observe(el);

    this.destroyRef.onDestroy(() => observer?.disconnect());
  }
}
