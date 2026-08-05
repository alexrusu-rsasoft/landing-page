import { computed, Injectable } from '@angular/core';
import { ExperienceItem } from './experience-item';
import { EXPERIENCES } from './experience-data';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  readonly #experiences = EXPERIENCES;
  readonly experiences = computed(() => this.#experiences.reverse());

  readonly numberOfProjects = computed(() => {
    return this.#experiences.reduce((acc: number, exp: ExperienceItem) => {
      const numberOfProjects = exp.projects.length;

      acc += numberOfProjects;

      return acc;
    }, 0);
  });

  readonly #startingYear = computed(() => {
    const thisYear = new Date().getFullYear();

    return this.#experiences.reduce((acc: number, exp: ExperienceItem) => {
      const experienceYear = exp.period.start.getFullYear();

      return Math.min(experienceYear, acc);
    }, thisYear);
  });

  readonly experienceInYears = computed(() => {
    const thisYear = new Date().getFullYear();
    const startingYear = this.#startingYear();
    return thisYear - startingYear;
  });
}
