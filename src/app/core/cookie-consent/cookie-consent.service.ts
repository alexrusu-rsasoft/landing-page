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

interface StoredConsent {
  status: 'accepted' | 'rejected';
  timestamp: number;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  readonly status = signal<CookieConsentStatus>(null);
  readonly bannerVisible = signal<boolean>(false);

  private analyticsLoaded = false;

  /** Called once at app startup: reads stored choice and shows banner if absent/expired. */
  init(): void {
    if (typeof window === 'undefined') return;

    const storedStatus = this.readStoredStatus();
    this.status.set(storedStatus);

    if (storedStatus === null) {
      this.bannerVisible.set(true);
    } else {
      this.bannerVisible.set(false);
      if (storedStatus === 'accepted') {
        this.loadAnalytics();
      }
    }
  }

  accept(): void {
    this.status.set('accepted');
    this.bannerVisible.set(false);
    this.store('accepted');
    setTimeout(() => this.loadAnalytics(), 0);
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
