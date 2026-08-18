import { Service } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RateOffer } from './rate-offer';

@Service()
export class OffersApi {
  readonly #apiURL = environment.offersApiUrl;

  fetchOffers(): Observable<RateOffer[]> {
    return from(
      fetch(this.#apiURL, {
        method: 'GET',
        redirect: 'follow',
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        return (json.data ?? json) as RateOffer[];
      }),
    );
  }
}
