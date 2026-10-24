import { Injectable, inject } from '@angular/core';
import { AttributionService } from './attribution.service';

// gtag is loaded via the script tag in index.html
declare const gtag: (...args: unknown[]) => void;

export type CtaLabel =
  | 'nav_free_call_desktop'
  | 'nav_free_call_mobile'
  | 'hero_free_call'
  | 'hero_view_protocol'
  | 'protocol_free_call'
  | 'profiles_free_call'
  | 'proof_free_call'
  | 'pricing_free_call'
  | 'final_free_call'
  | 'hero_urgent_call'
  | 'nav_careers_desktop'
  | 'nav_careers_mobile'
  | 'nav_send_profile_desktop'
  | 'nav_send_profile_mobile'
  | 'careers_hero_view_roles'
  | 'careers_hero_send_profile'
  | 'careers_final_send_profile'
  | 'call_confirmed_reschedule'
  | 'human_behind_free_call'
  | 'experience_free_call';

export type ContactLabel =
  | 'contact_phone'
  | 'contact_email'
  | 'contact_whatsapp'
  | 'contact_telegram'
  | 'contact_linkedin'
  | 'contact_xing';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly attribution = inject(AttributionService);

  trackCtaClick(label: CtaLabel): void {
    this.send('cta_click', { event_category: 'engagement', event_label: label });
  }

  trackContactClick(label: ContactLabel): void {
    this.send('contact_click', { event_category: 'engagement', event_label: label });
  }

  trackCareersApplyClick(opportunity: string): void {
    this.send('careers_apply_click', { event_category: 'careers', event_label: opportunity });
  }

  trackCareersViewDetails(opportunity: string): void {
    this.send('careers_view_details_click', { event_category: 'careers', event_label: opportunity });
  }

  trackCareersApplicationSubmit(opportunity: string): void {
    this.send('careers_application_submit', { event_category: 'careers', event_label: opportunity });
  }

  trackCareersShare(opportunity: string): void {
    this.send('careers_share_click', { event_category: 'careers', event_label: opportunity });
  }

  /** Fires once when the Google Calendar iframe scrolls into the viewport. */
  trackCalendarViewed(): void {
    this.send('calendar_section_viewed', { event_category: 'calendar' });
  }

  /**
   * Fires when the window loses focus because the user clicked into the iframe.
   * This is the strongest trackable signal of booking intent.
   */
  trackCalendarEngaged(): void {
    this.send('calendar_engaged', { event_category: 'calendar' });
  }

  /** Fires when the iframe finishes loading its content. */
  trackCalendarIframeLoaded(): void {
    this.send('calendar_iframe_loaded', { event_category: 'calendar' });
  }

  /** Fires when a visitor submits their email for the Quick Staffing Protocol PDF. */
  trackLeadMagnetSubmit(): void {
    this.send('lead_magnet_submit', { event_category: 'lead_magnet' });
  }

  /** Fires when a visitor clicks through to download the PDF after submitting. */
  trackLeadMagnetDownload(lang: string): void {
    this.send('lead_magnet_download', { event_category: 'lead_magnet', event_label: lang });
  }

  /** Fires when a visitor submits their email for Alex's CV PDF on /work-with-alex. */
  trackCvLeadSubmit(): void {
    this.send('cv_lead_submit', { event_category: 'cv_download' });
  }

  /** Fires when the generated CV PDF is downloaded. */
  trackCvDownload(lang: string): void {
    this.send('cv_download', { event_category: 'cv_download', event_label: lang });
  }

  /**
   * Fires once per page view as the visitor passes each scroll milestone (see
   * ScrollDepthTracker). GA4's built-in `scroll` event only reports 90%, so this
   * shows where people actually drop off.
   */
  trackScrollDepth(percent: number, pagePath: string): void {
    this.send('scroll_depth', {
      event_category: 'engagement',
      event_label: `${percent}%`,
      percent_scrolled: String(percent),
      page_path: pagePath,
    });
  }

  /** Fires once per page view when a section first scrolls into view (see TrackSectionViewDirective). */
  trackSectionView(section: string, pagePath: string): void {
    this.send('section_view', {
      event_category: 'engagement',
      event_label: section,
      section_name: section,
      page_path: pagePath,
    });
  }

  /**
   * Fires once per page view for each role in the /work-with-alex experience
   * timeline as it scrolls into view, so drop-off inside that long section shows
   * up: `index` is the role's 1-based position on the page, oldest first.
   */
  trackExperienceEntryView(index: number, company: string): void {
    this.send('experience_entry_view', {
      event_category: 'experience',
      event_label: company,
      entry_index: String(index),
      entry_company: company,
    });
  }

  /**
   * Fires for every photo shown in the "human behind the code" lightbox on
   * /work-with-alex: `via` is how it got there (click on the thumbnail, or
   * next/prev by button, arrow key or swipe).
   */
  trackPhotoView(photo: string, via: 'click' | 'next' | 'prev'): void {
    this.send('photo_view', { event_category: 'human_behind', event_label: photo, photo_name: photo, via });
  }

  /** Fires when the lightbox closes, with how many photos were looked at in that session. */
  trackLightboxClose(photosViewed: number): void {
    this.send('photo_lightbox_close', {
      event_category: 'human_behind',
      event_label: String(photosViewed),
      photos_viewed: String(photosViewed),
    });
  }

  private send(eventName: string, params: Record<string, string>): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, { ...params, ...this.attributionParams() });
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
