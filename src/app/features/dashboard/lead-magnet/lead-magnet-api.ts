import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LeadMagnetRequest {
  email: string;
  lang: string;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class LeadMagnetApi {
  readonly #apiURL = environment.leadMagnetApiUrl;

  /**
   * Fire-and-forget: Apps Script web apps don't handle CORS preflights, so
   * this uses `no-cors` with a text/plain body (a "simple request") and
   * never reads the response. Resolves once the request has been sent.
   */
  submitLead(request: LeadMagnetRequest): Observable<void> {
    return from(
      fetch(this.#apiURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(request),
      }).then(() => undefined),
    );
  }
}
