import { computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { applyPlatformCut } from '../../core/offers/rate-offer';
import { OffersService } from '../../core/offers/offers.service';
import { CareersApi } from './careers-api';

@Injectable({
  providedIn: 'root',
})
export class CareersService {
  readonly #api = inject(CareersApi);
  readonly #offers = inject(OffersService);

  readonly openingsResource = resource({
    loader: async () => {
      const obs = this.#api.fetchOpenings();
      return await firstValueFrom(obs);
    },
  });

  // Stage filtering (Dead/Closed/blank) happens server-side; the API never sends a stage field.
  // Hourly rates are shown net of the platform's cut (e.g. 25 €/h - 10 €/h = 15 €/h),
  // fetched app-wide at startup by OffersService.
  readonly openings = computed(() => {
    const cut = this.#offers.platformCut();
    return (this.openingsResource.value() ?? []).map((opening) => ({
      ...opening,
      hourly: applyPlatformCut(opening.hourly, cut),
    }));
  });

  readonly isLoading = this.openingsResource.isLoading;
  readonly hasError = computed(() => !!this.openingsResource.error());

  // True while the platform cut hasn't loaded yet — opening.hourly above is
  // still the uncut rate at that point, so templates should show a skeleton
  // instead of that transient value.
  readonly ratesLoading = this.#offers.isLoading;
}
