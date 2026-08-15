import { computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CareersApi } from './careers-api';

@Injectable({
  providedIn: 'root',
})
export class CareersService {
  readonly #api = inject(CareersApi);

  readonly openingsResource = resource({
    loader: async () => {
      const obs = this.#api.fetchOpenings();
      return await firstValueFrom(obs);
    },
  });

  // Stage filtering (Dead/Closed/blank) happens server-side; the API never sends a stage field.
  readonly openings = computed(() => this.openingsResource.value() ?? []);

  readonly isLoading = this.openingsResource.isLoading;
  readonly hasError = computed(() => !!this.openingsResource.error());
}
