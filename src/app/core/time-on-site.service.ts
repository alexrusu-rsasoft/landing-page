import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

/**
 * How long the visitor has had the site in front of them, for the leads sheet.
 * Only time with the tab visible counts (a tab left in the background isn't
 * time spent on the site), the same idea as GA4's engagement time. Kept in
 * memory from page load: moving between pages keeps the count, since every
 * internal link is a router link, and a reload starts it over.
 */
@Injectable({ providedIn: 'root' })
export class TimeOnSiteService {
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Visible time from earlier stretches, in ms. */
  #bankedMs = 0;
  /** `performance.now()` when the current visible stretch began, or null while the tab is hidden. */
  #visibleSince: number | null = null;

  /** Called once at app startup. */
  init(): void {
    if (!this.#isBrowser) return;

    // performance.now() counts from the moment the page started loading, so
    // the seconds spent waiting for the app to boot count too.
    if (this.#document.visibilityState === 'visible') this.#visibleSince = 0;
    this.#document.addEventListener('visibilitychange', () => this.#onVisibilityChange());
  }

  /** Visible time so far, in whole seconds. */
  seconds(): number {
    const current = this.#visibleSince === null ? 0 : performance.now() - this.#visibleSince;
    return Math.floor((this.#bankedMs + current) / 1000);
  }

  #onVisibilityChange(): void {
    const now = performance.now();
    if (this.#document.visibilityState === 'visible') {
      this.#visibleSince ??= now;
    } else if (this.#visibleSince !== null) {
      this.#bankedMs += now - this.#visibleSince;
      this.#visibleSince = null;
    }
  }
}
