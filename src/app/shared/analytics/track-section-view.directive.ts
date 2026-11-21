import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { AnalyticsSection, AnalyticsService } from '../../core/analytics.service';

/**
 * Sends a `<page>_<section>_view` event (e.g. `landing_pricing_view`) the first
 * time the host's top edge passes 60% of the viewport height, i.e. once the
 * visitor has actually scrolled into it rather than just glimpsed its edge.
 * Works for sections taller than the screen too.
 *
 * Usage: `<section appTrackSectionView="pricing">` (the name must be an AnalyticsSection)
 */
@Directive({ selector: '[appTrackSectionView]' })
export class TrackSectionViewDirective {
  readonly section = input.required<AnalyticsSection>({ alias: 'appTrackSectionView' });

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly analytics = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.analytics.trackSectionView(this.section());
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
