import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { CareersApplicationRequest } from './application-request';

// Submits straight to the Google Form's own response endpoint (the same form
// at https://forms.gle/6MAzy5qYx5bHhN3M6), so applications land in the exact
// sheet/inbox manual form fills would. Entry IDs were read off the form's
// public FB_PUBLIC_LOAD_DATA_ definition and are stable as long as the form's
// questions aren't rebuilt from scratch (reordering/editing existing
// questions doesn't change their entry IDs).
const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdSzNu-HFDKOTNBMgMZTnpFsvOXgeh-jh3fRCRJl3q2dhAd9Q/formResponse';

const ENTRY = {
  fullName: 'entry.1104481909',
  phone: 'entry.1322872310',
  email: 'entry.532273398',
  availability: 'entry.353217601',
  noticeEndDate: 'entry.1404661623',
  targetRole: 'entry.1502155117',
  techStack: 'entry.1019874021',
  yearsExperience: 'entry.1445822986',
  languages: 'entry.1703850555',
  collaborationType: 'entry.1177826410',
  expectedRate: 'entry.1599069124',
  gdprConsent: 'entry.2052634774',
};

@Injectable({ providedIn: 'root' })
export class CareersApplyApi {
  /**
   * Fire-and-forget: like the Apps Script endpoints elsewhere on this site,
   * Google's own form endpoint doesn't support a CORS preflight, so this
   * uses `no-cors` with a URL-encoded body (a "simple request") and never
   * reads the response. Resolves once the request has been sent, not once
   * Google has confirmed it recorded the answer.
   */
  submitApplication(request: CareersApplicationRequest): Observable<void> {
    const body = new URLSearchParams();
    body.set(ENTRY.fullName, request.fullName);
    body.set(ENTRY.phone, request.phone);
    body.set(ENTRY.email, request.email);
    body.set(ENTRY.availability, request.availability);

    if (request.noticeEndDate) {
      const [year, month, day] = request.noticeEndDate.split('-');
      body.set(`${ENTRY.noticeEndDate}_year`, year);
      body.set(`${ENTRY.noticeEndDate}_month`, month);
      body.set(`${ENTRY.noticeEndDate}_day`, day);
    }

    body.set(ENTRY.targetRole, request.targetRole);
    body.set(ENTRY.techStack, request.techStack);
    body.set(ENTRY.yearsExperience, request.yearsExperience);
    body.set(ENTRY.languages, request.languages);

    if (request.collaborationType) {
      body.set(ENTRY.collaborationType, request.collaborationType);
    }

    body.set(ENTRY.expectedRate, request.expectedRate);
    // Consent is a hard requirement in our own UI before submit is even
    // reachable, so the value sent back is always the affirmative choice.
    body.set(ENTRY.gdprConsent, 'Approved');
    // Required for multi-page Google Forms to record answers from every page.
    body.set('pageHistory', '0,1,2,3');

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
