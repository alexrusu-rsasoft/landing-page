import { computed, inject, Injectable, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DeveloperProfilesApi } from './developer-profiles-api';

@Injectable({
  providedIn: 'root',
})
export class DeveloperProfilesService {
  readonly #api = inject(DeveloperProfilesApi);

  readonly profilesResource = resource({
    loader: async () => {
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
