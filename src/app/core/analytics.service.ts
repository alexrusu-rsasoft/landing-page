import { Injectable, inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { AttributionService } from './attribution.service';

// gtag is loaded via the script tag in index.html
declare const gtag: (...args: unknown[]) => void;

/*
 * Every event is named `<page>_<section>_<action>`, so the GA4 Events report says
 * where on the site it happened without adding any dimension:
 * `landing_hero_free_call_click`, `careers_navbar_send_profile_click`,
 * `alex_human_behind_photo_view`. The page comes from the URL (see pageForPath), so
 * the navbar and other shared pieces report under whichever page they were used on.
 * docs/analytics-events.md lists every event and what it means.
 *
 * GA4 drops events whose name is longer than 40 characters, so keep section and
 * action names short (send() complains in dev mode when one is too long).
 */
const MAX_EVENT_NAME_LENGTH = 40;

/** The first part of every event name: which page it happened on. */
export type AnalyticsPage =
  | 'landing' // / and /dashboard
  | 'alex' // /work-with-alex
  | 'careers' // /careers
  | 'careers_job' // /careers/<role>
  | 'contact'
  | 'calendar'
  | 'call_confirmed'
  | 'legal' // privacy policy, cookie policy, terms, legal notice, accessibility
  | 'not_found';

/** The second part: the zone of the page. Section views use the same names (TrackSectionViewDirective). */
export type AnalyticsSection =
  // Every page
  | 'navbar'
  // Landing page
  | 'hero'
  | 'services'
  | 'projects'
  | 'process'
  | 'profiles'
  | 'pricing'
  | 'founder'
  | 'faq'
  | 'lead_magnet'
  | 'final_cta'
  // /work-with-alex
  | 'why_choose_me'
  | 'featured_video'
  | 'experience'
  | 'experience_end'
  | 'about'
  | 'human_behind'
  | 'human_behind_gallery'
  | 'human_behind_books'
  | 'human_behind_cta'
  | 'skills'
  | 'education'
  | 'cv_banner' // sticky "download CV" bar, xl screens and up
  | 'cv_bubble' // floating "download CV" button + fullscreen form, below xl
  // Careers pages
  | 'openings'
  | 'header'
  | 'apply_banner'
  | 'error'
  | 'apply_form'
  // Contact, calendar and call-confirmed pages
  | 'urgent'
  | 'booking'
  | 'channels'
  | 'research'
  | 'footer';

/** What was clicked: the `<cta>` in `<page>_<section>_<cta>_click`. */
export type AnalyticsCta =
  | 'free_call'
  | 'project_call'
  | 'team_call'
  | 'view_profiles'
  | 'view_cv'
  | 'trust_badge'
  | 'careers'
  | 'send_profile'
  | 'view_roles'
  | 'apply'
  | 'share'
  | 'reschedule'
  | ContactChannel;

export type ContactChannel = 'phone' | 'email' | 'whatsapp' | 'linkedin' | 'xing';

/** The two places the CV email form lives on /work-with-alex. */
export type CvSurface = Extract<AnalyticsSection, 'cv_banner' | 'cv_bubble'>;

type EventParams = Record<string, string>;

/** Which page a URL belongs to, as named in event names. */
export function pageForPath(url: string): AnalyticsPage {
  const [first = '', second] = url.split(/[?#]/)[0].split('/').filter(Boolean);
  switch (first) {
    case '':
    case 'dashboard':
      return 'landing';
    case 'work-with-alex':
      return 'alex';
    case 'careers':
      return second ? 'careers_job' : 'careers';
    case 'contact':
      return 'contact';
    case 'calendar':
      return 'calendar';
    case 'call-confirmed':
      return 'call_confirmed';
    case 'privacy-policy':
    case 'cookie-policy':
    case 'terms':
    case 'legal-notice':
    case 'accessibility':
      return 'legal';
    default:
      return 'not_found';
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly attribution = inject(AttributionService);
  private readonly router = inject(Router);

  /**
   * A visitor clicked a button or link: `<page>_<section>_<cta>_click`, e.g.
   * `landing_pricing_free_call_click`. `label` carries the detail that tells
   * clicks with the same name apart (desktop or mobile menu, which role).
   */
  trackClick(
    section: AnalyticsSection,
    cta: AnalyticsCta,
    label?: string,
    params: EventParams = {},
  ): void {
    this.send(section, `${cta}_click`, { ...(label ? { event_label: label } : {}), ...params });
  }

  /** Fires once per page view when a section first scrolls into view (see TrackSectionViewDirective): `<page>_<section>_view`. */
  trackSectionView(section: AnalyticsSection): void {
    this.send(section, 'view', { event_label: section });
  }

  /**
   * Fires once per page view as the visitor passes each scroll milestone (see
   * ScrollDepthTracker): `<page>_scroll_25` … `<page>_scroll_100`. GA4's built-in
   * `scroll` event only reports 90%, so this shows where people actually drop off.
   */
  trackScrollDepth(percent: number, pagePath: string): void {
    this.send(
      null,
      `scroll_${percent}`,
      { event_label: `${percent}%`, percent_scrolled: String(percent), page_path: pagePath },
      pagePath,
    );
  }

  /** A candidate filtered the open roles by technology (typed or via a quick-pick chip): `careers_openings_search`. */
  trackCareersSearch(term: string, results: number, method: 'typed' | 'chip'): void {
    this.send('openings', 'search', { search_term: term, results_count: String(results), method });
  }

  /** A role's own page showed that role, once per role per visit to the page: `careers_job_view`. */
  trackJobView(opportunity: string): void {
    this.send(null, 'view', { event_label: opportunity });
  }

  /**
   * The "send your profile" form went through: `careers_apply_form_submit` or
   * `careers_job_apply_form_submit`. `openedFrom` is the section whose button opened it.
   */
  trackApplyFormSubmit(opportunity: string, openedFrom: AnalyticsSection): void {
    this.send('apply_form', 'submit', {
      event_label: opportunity || 'general',
      opened_from: openedFrom,
    });
  }

  /** The application request failed to send (network, CSP, blocker); the candidate can retry. */
  trackApplyFormError(opportunity: string, openedFrom: AnalyticsSection): void {
    this.send('apply_form', 'error', {
      event_label: opportunity || 'general',
      opened_from: openedFrom,
    });
  }

  /** Fires once when the booking calendar (the Google Calendar iframe) scrolls into the viewport: `contact_booking_view`. */
  trackBookingView(): void {
    this.send('booking', 'view', {});
  }

  /**
   * Fires when the window loses focus because the visitor clicked into the booking
   * calendar: `contact_booking_engaged`. This is the strongest trackable signal of booking intent.
   */
  trackBookingEngaged(): void {
    this.send('booking', 'engaged', {});
  }

  /**
   * Fires when the booking calendar iframe finishes loading: `contact_booking_load`,
   * `calendar_booking_load`. An iframe also fires `load` for the empty about:blank
   * document it holds before Angular sets its src; that one is skipped, so only the
   * calendar itself counts.
   */
  trackBookingLoad(iframe: HTMLIFrameElement): void {
    // The empty document is same-origin, so it's readable; Google Calendar's isn't (null).
    if (iframe.contentDocument?.URL === 'about:blank') return;
    this.send('booking', 'load', {});
  }

  /** Fires when a visitor's email for the Quick Staffing Protocol PDF went out to the leads form: `landing_lead_magnet_submit`. */
  trackLeadMagnetSubmit(): void {
    this.send('lead_magnet', 'submit', {});
  }

  /** The staffing PDF email couldn't be sent (offline, blocker, CSP); the visitor still gets the PDF: `landing_lead_magnet_error`. */
  trackLeadMagnetError(): void {
    this.send('lead_magnet', 'error', {});
  }

  /** Fires when a visitor clicks through to download the PDF after submitting: `landing_lead_magnet_download`. */
  trackLeadMagnetDownload(lang: string): void {
    this.send('lead_magnet', 'download', { event_label: lang });
  }

  /** Fires when a visitor's email for Alex's CV PDF went out to the leads form: `alex_cv_banner_lead_submit` / `alex_cv_bubble_lead_submit`. */
  trackCvLeadSubmit(surface: CvSurface): void {
    this.send(surface, 'lead_submit', {});
  }

  /** The CV email couldn't be sent (offline, blocker, CSP); the CV still downloads: `alex_cv_banner_lead_error` / `alex_cv_bubble_lead_error`. */
  trackCvLeadError(surface: CvSurface): void {
    this.send(surface, 'lead_error', {});
  }

  /** Fires when the generated CV PDF is downloaded: `alex_cv_banner_download` / `alex_cv_bubble_download`. */
  trackCvDownload(surface: CvSurface, lang: string): void {
    this.send(surface, 'download', { event_label: lang });
  }

  /**
   * Fires once per page view for each role in the /work-with-alex experience
   * timeline as it scrolls into view, so drop-off inside that long section shows
   * up: `alex_experience_entry_view`. `index` is the role's 1-based position on the
   * page, oldest first.
   */
  trackExperienceEntryView(index: number, company: string): void {
    this.send('experience', 'entry_view', {
      event_label: company,
      entry_index: String(index),
      entry_company: company,
    });
  }

  /**
   * Fires for every photo shown in the "human behind the code" lightbox on
   * /work-with-alex: `alex_human_behind_photo_view`. `via` is how it got there (click
   * on the thumbnail, or next/prev by button, arrow key or swipe).
   */
  trackPhotoView(photo: string, via: 'click' | 'next' | 'prev'): void {
    this.send('human_behind', 'photo_view', { event_label: photo, photo_name: photo, via });
  }

  /** Fires when the lightbox closes, with how many photos were looked at in that session: `alex_human_behind_lightbox_close`. */
  trackLightboxClose(photosViewed: number): void {
    this.send('human_behind', 'lightbox_close', {
      event_label: String(photosViewed),
      photos_viewed: String(photosViewed),
    });
  }

  /**
   * Sends `<page>_<section>_<action>` (or `<page>_<action>` without a section).
   * Reading the page at send time is safe for clicks on router links: Angular only
   * moves to the new URL asynchronously, after the click handlers have run.
   */
  private send(
    section: AnalyticsSection | null,
    action: string,
    params: EventParams,
    path = this.router.url,
  ): void {
    if (typeof gtag === 'undefined') return;

    const page = pageForPath(path);
    const eventName = [page, section, action].filter(Boolean).join('_');
    if (isDevMode() && eventName.length > MAX_EVENT_NAME_LENGTH) {
      console.error(
        `GA4 drops event names longer than ${MAX_EVENT_NAME_LENGTH} characters: ${eventName}`,
      );
    }

    gtag('event', eventName, {
      page_name: page,
      ...(section ? { section_name: section } : {}),
      ...params,
      ...this.attributionParams(),
    });
  }

  /**
   * Tags every event with the visitor's last known marketing channel
   * (LinkedIn, YouTube, a direct link sent by Alex, etc.) so any event —
   * not just pageviews — can be broken down by source/medium/campaign in
   * GA4, even across sessions. See AttributionService for the model.
   */
  private attributionParams(): Record<string, string> {
    const attribution = this.attribution.get();
    if (!attribution) return {};

    const params: Record<string, string> = {
      lead_source: attribution.source,
      lead_medium: attribution.medium,
    };
    if (attribution.campaign) params['lead_campaign'] = attribution.campaign;
    if (attribution.content) params['lead_content'] = attribution.content;
    return params;
  }
}
