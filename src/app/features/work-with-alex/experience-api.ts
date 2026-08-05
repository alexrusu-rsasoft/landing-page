import { Service } from '@angular/core';
import { ExperienceItem } from './experience-item';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class ExperienceApi {
  readonly #apiURL = environment.experienceApiUrl;

  fetchExperiences(): Observable<ExperienceItem[]> {
    return from(
      fetch(this.#apiURL, {
        method: 'GET',
        redirect: 'follow',
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        return (json.data ?? json) as ExperienceItem[];
      }),
    );
  }
}
