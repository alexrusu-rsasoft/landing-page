import { Injectable, signal } from '@angular/core';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'rsa-soft-cookie-consent';

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

interface StoredConsent {
  status: 'accepted' | 'rejected';
  timestamp: number;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Google Consent Mode v2 signal sets. gtag.js is always loaded (see
// index.html) with all four defaulted to "denied" — this only ever raises
// or re-lowers them in response to the visitor's own choice.
const GRANTED_CONSENT = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

const DENIED_CONSENT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  readonly status = signal<CookieConsentStatus>(null);
  readonly bannerVisible = signal<boolean>(false);

  /** Called once at app startup: reads stored choice and shows banner if absent/expired. */
  init(): void {
    if (typeof window === 'undefined') return;

    const storedStatus = this.readStoredStatus();
    this.status.set(storedStatus);

    if (storedStatus === null) {
      this.bannerVisible.set(true);
    } else {
      this.bannerVisible.set(false);
      this.updateConsent(storedStatus);
    }
  }

  accept(): void {
    this.status.set('accepted');
    this.bannerVisible.set(false);
    this.store('accepted');
    this.updateConsent('accepted');
  }

  reject(): void {
    this.status.set('rejected');
    this.bannerVisible.set(false);
    this.store('rejected');
    this.updateConsent('rejected');
  }

  /** Re-opens the banner so a visitor can change an earlier decision (e.g. from a footer link). */
  reopen(): void {
    this.bannerVisible.set(true);
  }

  /**
   * Pushes the visitor's choice to Google as a Consent Mode v2 update. While
   * denied (the default, and what "Reject Non-Essential" restores), Google
   * sets no cookies and stores no identifiable data — it only receives
   * anonymous, cookie-free pings for aggregated modelling.
   */
  private updateConsent(status: 'accepted' | 'rejected'): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', status === 'accepted' ? GRANTED_CONSENT : DENIED_CONSENT);
  }

  private readStoredStatus(): CookieConsentStatus {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      // Backward compatibility with legacy plain string values
      if (raw === 'accepted' || raw === 'rejected') {
        this.store(raw);
        return raw;
      }

      const parsed = JSON.parse(raw) as StoredConsent;
      if (!parsed || (parsed.status !== 'accepted' && parsed.status !== 'rejected') || !parsed.timestamp) {
        return null;
      }

      const isExpired = Date.now() - parsed.timestamp > ONE_MONTH_MS;
      if (isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed.status;
    } catch {
      return null;
    }
  }

  private store(value: 'accepted' | 'rejected'): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const payload: StoredConsent = {
        status: value,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage unavailable (private browsing). Consent still applies for this session.
    }
  }
}
