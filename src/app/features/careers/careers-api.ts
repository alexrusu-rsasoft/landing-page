import { Service } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CareerOpening } from './career-opening';

@Service()
export class CareersApi {
  readonly #apiURL = environment.careersApiUrl;

  fetchOpenings(): Observable<CareerOpening[]> {
    return from(
      fetch(this.#apiURL, {
        method: 'GET',
        redirect: 'follow',
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        return (json.data ?? json) as CareerOpening[];
      }),
    );
  }
}
