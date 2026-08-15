import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { filter, race, take, timer } from 'rxjs';
import { Layout } from './core/layout/layout';
import { CookieConsentBanner } from './core/cookie-consent/cookie-consent-banner';

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
    inject(ViewportScroller).setOffset([0, 80]);

    // app-root starts hidden (see index.html) so the shell (header/footer)
    // and the routed page content paint together in one frame instead of
    // the footer visibly jumping into place once navigation resolves. The
    // timer is a safety net so a failed/cancelled navigation can never leave
    // the page permanently blank.
    const hostElement = inject(ElementRef<HTMLElement>).nativeElement;
    const router = inject(Router);
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
