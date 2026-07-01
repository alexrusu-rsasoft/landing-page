import { Injectable } from '@angular/core';

// gtag is loaded via the script tag in index.html
declare const gtag: (...args: unknown[]) => void;

export type CtaLabel =
  | 'nav_free_call_desktop'
  | 'nav_free_call_mobile'
  | 'hero_free_call'
  | 'hero_view_cases';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackCtaClick(label: CtaLabel): void {
    this.send('cta_click', { event_category: 'engagement', event_label: label });
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

  private send(eventName: string, params: Record<string, string>): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, params);
  }
}
