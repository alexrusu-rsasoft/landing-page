import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { CookieConsentService } from '../../../core/cookie-consent/cookie-consent.service';
import { TimeOnSiteService } from '../../../core/time-on-site.service';

// Posts straight to the "Lead Magnet Site" Google Form, so every lead lands in
// its responses and in the sheet linked to it, exactly like a manual form fill.
// The visitor only types the email; the site fills in everything else. Entry
// IDs were read off the form's public FB_PUBLIC_LOAD_DATA_ definition. Editing
// or reordering a question keeps its ID; deleting and re-adding a question
// gives it a new one, which then has to be updated here.
const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe5F86s11GLV_h3ke6IyKubBNVfyTJtiSA8vV4q0UfXrYk64g/formResponse';

const ENTRY = {
  email: 'entry.501718841',
  language: 'entry.1510634789',
  source: 'entry.986805377',
  // A Duration question, answered as separate _hour, _minute and _second fields.
  timeOnSite: 'entry.824123254',
};

// The form's hours box stops at 72, so a longer visit is sent as the maximum
// instead of a value the form itself wouldn't accept.
const MAX_DURATION_SECONDS = 72 * 3600 + 59 * 60 + 59;

/**
 * Where on the site the email was sent from, named like the GA4 events. If the
 * form's Source question is multiple choice, its options must be exactly these,
 * otherwise Google rejects the response.
 */
export type LeadSource = 'landing_lead_magnet' | 'alex_cv_banner' | 'alex_cv_bubble';

export interface LeadMagnetRequest {
  email: string;
  lang: string;
  source: LeadSource;
}

@Injectable({ providedIn: 'root' })
export class LeadMagnetApi {
  readonly #consent = inject(CookieConsentService);
  readonly #timeOnSite = inject(TimeOnSiteService);

  /**
   * Fire-and-forget: Google's form endpoint sends no CORS headers, so this
   * posts a URL-encoded "simple request" in `no-cors` mode and can't read the
   * response. It resolves once the request has been sent, and rejects only
   * when the browser couldn't send it at all (offline, or blocked by an
   * extension, a company proxy or the CSP), never because Google refused it.
   */
  submitLead(request: LeadMagnetRequest): Observable<void> {
    const body = new URLSearchParams();
    body.set(ENTRY.email, request.email);
    body.set(ENTRY.language, request.lang);
    body.set(ENTRY.source, request.source);

    // The privacy policy says data measured automatically is only collected
    // once the visitor accepts analytics cookies, so without that consent the
    // time column stays empty.
    if (this.#consent.status() === 'accepted') {
      const seconds = Math.min(this.#timeOnSite.seconds(), MAX_DURATION_SECONDS);
      body.set(`${ENTRY.timeOnSite}_hour`, String(Math.floor(seconds / 3600)));
      body.set(`${ENTRY.timeOnSite}_minute`, String(Math.floor((seconds % 3600) / 60)));
      body.set(`${ENTRY.timeOnSite}_second`, String(seconds % 60));
    }

    return from(
      fetch(FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString(),
      }).then(() => undefined),
    );
  }
}
