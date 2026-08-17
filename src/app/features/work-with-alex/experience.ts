import { computed, inject, Injectable, PLATFORM_ID, resource } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ExperienceItem } from './experience-item';
import { ExperienceApi } from './experience-api';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  readonly #api = inject(ExperienceApi);
  readonly #platformId = inject(PLATFORM_ID);

  // Resource tracking the async experience data. Skipped on the server: this
  // route is prerendered at build time, and this data comes from a live,
  // occasionally slow third-party API (Apps Script) that a build shouldn't
  // depend on. The client re-fetches on hydration instead.
  readonly experienceResource = resource({
    loader: async ({ abortSignal }) => {
      if (!isPlatformBrowser(this.#platformId)) return [];
      const obs = this.#api.fetchExperiences();
      return await firstValueFrom(obs);
    },
  });

  // Derived signals
  readonly experiences = computed(() => (this.experienceResource.value() ?? []).slice().reverse());
  readonly isLoading = this.experienceResource.isLoading;

  readonly numberOfProjects = computed(() => {
    return (this.experienceResource.value() ?? []).reduce(
      (acc, exp) => acc + (exp.projects?.length ?? 0),
      0,
    );
  });

  readonly #startingYear = computed(() => {
    const thisYear = new Date().getFullYear();
    const earliest = (this.experienceResource.value() ?? []).reduce((min, exp) => {
      if (!exp?.start) return min;
      const date = new Date(exp.start);
      if (Number.isNaN(date.getTime())) return min;
      const year = date.getFullYear();
      return year < min ? year : min;
    }, thisYear);
    return earliest;
  });

  readonly experienceInYears = computed(() => {
    const thisYear = new Date().getFullYear();
    const start = this.#startingYear();
    return start && start <= thisYear ? thisYear - start : 0;
  });
}
