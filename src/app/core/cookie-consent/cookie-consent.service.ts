import { Injectable, signal } from '@angular/core';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'rsa-soft-cookie-consent';
const GA_MEASUREMENT_ID = 'G-ZY2RCK6GLL';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  readonly status = signal<CookieConsentStatus>(this.readStoredStatus());
  readonly bannerVisible = signal<boolean>(this.status() === null);

  private analyticsLoaded = false;

  /** Called once at app startup: silently re-enables analytics for returning visitors who already consented. */
  init(): void {
    if (this.status() === 'accepted') {
      this.loadAnalytics();
    }
  }

  accept(): void {
    this.status.set('accepted');
    this.bannerVisible.set(false);
    this.store('accepted');
    this.loadAnalytics();
  }

  reject(): void {
    this.status.set('rejected');
    this.bannerVisible.set(false);
    this.store('rejected');
  }

  /** Re-opens the banner so a visitor can change an earlier decision (e.g. from a footer link). */
  reopen(): void {
    this.bannerVisible.set(true);
  }

  private loadAnalytics(): void {
    if (this.analyticsLoaded || typeof document === 'undefined') return;
    this.analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    const gtag: Gtag = (...args) => window.dataLayer?.push(args);
    window.gtag = gtag;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  private readStoredStatus(): CookieConsentStatus {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'accepted' || value === 'rejected' ? value : null;
    } catch {
      return null;
    }
  }

  private store(value: 'accepted' | 'rejected'): void {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Storage unavailable (private browsing). Consent still applies for this session.
    }
  }
}
