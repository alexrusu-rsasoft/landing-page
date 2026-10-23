import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './analytics.service';

/** Percent of the page that has been on screen (viewport bottom / page height). */
const MILESTONES = [25, 50, 75, 90, 100] as const;
/** Sub-pixel rounding can leave the very bottom a fraction short of 100%. */
const BOTTOM_SLACK_PX = 4;

/**
 * Reports how far down each page visitors scroll, as one `scroll_depth` event per
 * milestone per page view. Milestones reset when the route path changes (not on
 * in-page #anchor jumps), so every page gets its own funnel.
 */
@Injectable({ providedIn: 'root' })
export class ScrollDepthTracker {
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private pagePath = '';
  private readonly reached = new Set<number>();
  private frameRequested = false;

  start(): void {
    if (!this.isBrowser) return;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path === this.pagePath) return;
        this.pagePath = path;
        this.reached.clear();
      });

    window.addEventListener('scroll', () => this.scheduleMeasure(), { passive: true });
  }

  /** Coalesces scroll events into at most one measurement per frame. */
  private scheduleMeasure(): void {
    if (this.frameRequested) return;
    this.frameRequested = true;
    requestAnimationFrame(() => {
      this.frameRequested = false;
      this.measure();
    });
  }

  private measure(): void {
    if (!this.pagePath || this.reached.size === MILESTONES.length) return;

    const pageHeight = document.documentElement.scrollHeight;
    const seenBottom = window.scrollY + window.innerHeight;
    const percent = seenBottom >= pageHeight - BOTTOM_SLACK_PX ? 100 : (seenBottom / pageHeight) * 100;

    for (const milestone of MILESTONES) {
      if (percent >= milestone && !this.reached.has(milestone)) {
        this.reached.add(milestone);
        this.analytics.trackScrollDepth(milestone, this.pagePath);
      }
    }
  }
}
