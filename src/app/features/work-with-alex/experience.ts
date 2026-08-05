import { computed, inject, Injectable, resource } from '@angular/core';
import { ExperienceItem } from './experience-item';
import { ExperienceApi } from './experience-api';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  readonly #api = inject(ExperienceApi);

  // Resource tracking the async experience data
  readonly experienceResource = resource({
    loader: async ({ abortSignal }) => {
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
