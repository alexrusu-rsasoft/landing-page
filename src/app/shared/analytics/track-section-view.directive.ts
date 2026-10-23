import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../core/analytics.service';

/**
 * Sends a `section_view` event the first time the host's top edge passes 60% of
 * the viewport height, i.e. once the visitor has actually scrolled into it rather
 * than just glimpsed its edge. Works for sections taller than the screen too.
 *
 * Usage: `<section appTrackSectionView="pricing">`
 */
@Directive({ selector: '[appTrackSectionView]' })
export class TrackSectionViewDirective {
  readonly section = input.required<string>({ alias: 'appTrackSectionView' });

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.analytics.trackSectionView(this.section(), this.router.url.split(/[?#]/)[0]);
          observer?.disconnect();
          observer = null;
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40% 0px' },
    );
    observer.observe(this.elementRef.nativeElement);

    this.destroyRef.onDestroy(() => observer?.disconnect());
  }
}
