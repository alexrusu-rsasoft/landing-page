import { computed, inject, Injectable, PLATFORM_ID, resource } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DeveloperProfilesApi } from './developer-profiles-api';

@Injectable({
  providedIn: 'root',
})
export class DeveloperProfilesService {
  readonly #api = inject(DeveloperProfilesApi);
  readonly #platformId = inject(PLATFORM_ID);

  // Skipped on the server: this section renders on prerendered routes ('' and
  // 'dashboard'), and profile data comes from a live third-party API that a
  // build shouldn't depend on. The client re-fetches on hydration instead.
  readonly profilesResource = resource({
    loader: async () => {
      if (!isPlatformBrowser(this.#platformId)) return [];
      const obs = this.#api.fetchProfiles();
      return await firstValueFrom(obs);
    },
  });

  // Eligibility (Shareable profile + GDPR Confirmed) is enforced server-side;
  // the API never sends contact details, rates, CVs or gate columns.
  readonly profiles = computed(() => this.profilesResource.value() ?? []);

  readonly isLoading = this.profilesResource.isLoading;
  readonly hasError = computed(() => !!this.profilesResource.error());
}
