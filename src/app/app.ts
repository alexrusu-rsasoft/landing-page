import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { filter, race, take, timer } from 'rxjs';
import { Layout } from './core/layout/layout';
import { CookieConsentBanner } from './core/cookie-consent/cookie-consent-banner';
import { ScrollDepthTracker } from './core/scroll-depth-tracker.service';

const REVEAL_FALLBACK_MS = 3000;

@Component({
  selector: 'app-root',
  imports: [Layout, CookieConsentBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    // Angular's anchorScrolling ignores CSS scroll-padding-top / scroll-margin-top.
    // ViewportScroller.setOffset is the correct way to reserve space for the sticky nav.
    const viewportScroller = inject(ViewportScroller);
    viewportScroller.setOffset([0, 80]);
    const router = inject(Router);

    // The router scrolls a new page to the top only a frame after showing it, and
    // smoothly (scroll-behavior in styles.css), so the page first appeared at the old
    // page's scroll position and then slid up through its content, which also sent GA
    // section views for parts the visitor never scrolled to. Jump to the top as soon as
    // a different page is in place; #anchor links still scroll smoothly from there.
    let currentPath: string | null = null;
    router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (currentPath !== null && path !== currentPath) {
          viewportScroller.scrollToPosition([0, 0], { behavior: 'instant' });
        }
        currentPath = path;
      });

    inject(ScrollDepthTracker).start();

    // app-root starts hidden (see index.html) so the shell (header/footer)
    // and the routed page content paint together in one frame instead of
    // the footer visibly jumping into place once navigation resolves. The
    // timer is a safety net so a failed/cancelled navigation can never leave
    // the page permanently blank.
    const hostElement = inject(ElementRef<HTMLElement>).nativeElement;
    race(
      router.events.pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      ),
      timer(REVEAL_FALLBACK_MS),
    )
      .pipe(take(1))
      .subscribe(() => {
        hostElement.style.visibility = 'visible';
      });
  }
}
