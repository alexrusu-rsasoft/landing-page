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
 * Reports how far down each page visitors scroll, as one `<page>_scroll_<percent>`
 * event per milestone per page view (`landing_scroll_50`, `careers_scroll_100`).
 * Milestones reset when the route path changes (not on in-page #anchor jumps), so
 * every page gets its own funnel.
 */
@Injectable({ providedIn: 'root' })
export class ScrollDepthTracker {
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private pagePath = '';
  private readonly reached = new Set<number>();
  private frameRequested = false;
  private skipping = false;

  start(): void {
    if (!this.isBrowser) return;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path === this.pagePath) return;
        // A new page opens with a jump to its top (App makes it as soon as the page is in
        // place), whose scroll event arrives in the next frame. That isn't the visitor
        // scrolling, and on a short page the top alone would already pass a milestone or two.
        if (this.pagePath) this.skipNextFrame();
        this.pagePath = path;
        this.reached.clear();
      });

    window.addEventListener('scroll', () => this.scheduleMeasure(), { passive: true });
  }

  /**
   * Skips the measurements of the coming frame. Registered now, this callback runs before
   * any measurement that frame's scroll event schedules, and lifts the skip a frame later.
   */
  private skipNextFrame(): void {
    this.skipping = true;
    requestAnimationFrame(() => requestAnimationFrame(() => (this.skipping = false)));
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
    if (this.skipping || !this.pagePath || this.reached.size === MILESTONES.length) return;

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
