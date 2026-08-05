import { Service } from '@angular/core';
import { ExperienceItem } from './experience-item';
import { from, Observable } from 'rxjs';

@Service()
export class ExperienceApi {
  readonly #apiURL =
    'https://script.google.com/macros/s/AKfycbxKhsSJpOdyaXT9AIz9N-wjgecoAqyf-rpUHm3GK4SGrSrlkvGx3lAPJiYmKCVdaBW_/exec';

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
