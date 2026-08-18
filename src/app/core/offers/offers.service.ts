import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OffersApi } from './offers-api';

@Injectable({ providedIn: 'root' })
export class OffersService {
  private readonly api = inject(OffersApi);
  private readonly platformId = inject(PLATFORM_ID);

  // Starts loading as soon as this service is first injected (see the
  // app initializer in app.config.ts, which injects it eagerly at startup).
  readonly offersResource = resource({
    loader: async () => {
      // No point hitting the offers endpoint at build/render time on the
      // server; resolve empty and let the client fetch the real value on
      // hydration, same as LocaleService does for language.
      if (!isPlatformBrowser(this.platformId)) return [];

      try {
        return await firstValueFrom(this.api.fetchOffers());
      } catch {
        // Offers are an enhancement (rate cut), not critical data. A failed
        // fetch (endpoint not configured yet, network error) falls back to
        // no cut instead of leaving the resource in an error state — reading
        // resource.value() while errored throws, which would break every
        // computed downstream of platformCut.
        return [];
      }
    },
  });

  // The first offer returned by the API (id 1, special = FALSE, no client) is
  // the platform's flat per-hour cut — applied everywhere a rate is shown net
  // of it (cost calculator margin, career page hourly rates). Defaults to 0
  // (no cut) while loading or if the fetch fails; consumers should check
  // isLoading themselves to show a skeleton instead of a misleading 0.
  readonly platformCut = computed(() => this.offersResource.value()?.[0]?.price ?? 0);

  readonly isLoading = this.offersResource.isLoading;
}
