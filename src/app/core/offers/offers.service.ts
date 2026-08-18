import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { OffersApi } from './offers-api';

// Kept short because this blocks the app's very first render (see init/appInitializer,
// same tradeoff as LocaleService's geo-IP lookup): a slow/unreachable offers
// endpoint should fall back fast rather than stall FCP.
const OFFERS_TIMEOUT_MS = 1500;

@Injectable({ providedIn: 'root' })
export class OffersService {
  private readonly api = inject(OffersApi);
  private readonly platformId = inject(PLATFORM_ID);

  // The first offer returned by the API (id 1, special = FALSE, no client) is
  // the platform's flat per-hour cut — applied everywhere a rate is shown net
  // of it (cost calculator margin, career page hourly rates).
  readonly platformCut = signal(0);

  /** Called once at app startup: fetches the offers table and stores the first offer's price. */
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      // No point hitting the offers endpoint at build/render time on the
      // server; render with the default (no cut) and let the client fetch
      // the real value on hydration, same as LocaleService does for language.
      return;
    }

    const offers = await firstValueFrom(
      this.api.fetchOffers().pipe(
        timeout(OFFERS_TIMEOUT_MS),
        catchError(() => of([])),
      ),
    );
    this.platformCut.set(offers[0]?.price ?? 0);
  }
}
