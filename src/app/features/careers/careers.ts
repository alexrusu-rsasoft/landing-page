import { computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CareersApi } from './careers-api';
import { CareerOpening } from './career-opening';

const EXCLUDED_STAGES = new Set(['dead', 'closed']);

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

  // Defense in depth: the API already excludes Dead/Closed rows, but we never render them either way.
  readonly openings = computed(() =>
    (this.openingsResource.value() ?? []).filter(
      (opening) => !EXCLUDED_STAGES.has((opening.stage ?? '').trim().toLowerCase()),
    ),
  );

  readonly isLoading = this.openingsResource.isLoading;
  readonly hasError = computed(() => !!this.openingsResource.error());
}
