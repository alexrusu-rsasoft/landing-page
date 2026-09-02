import { Injectable } from '@angular/core';

export interface Attribution {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
}

const STORAGE_KEY = 'rsa-soft-attribution';
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface StoredAttribution {
  attribution: Attribution;
  timestamp: number;
}

// Known referrer domains mapped to a clean source/medium for visitors who
// arrive via a raw shared link with no UTM params.
const REFERRER_RULES: Array<{ pattern: RegExp; source: string; medium: string }> = [
  { pattern: /linkedin\.com/i, source: 'linkedin', medium: 'social' },
  { pattern: /(youtube\.com|youtu\.be)/i, source: 'youtube', medium: 'social' },
  { pattern: /google\./i, source: 'google', medium: 'organic' },
  { pattern: /bing\./i, source: 'bing', medium: 'organic' },
];

/**
 * Captures which channel brought a visitor in and persists it across the
 * whole visitor lifetime (90 days), not just the current GA4 session — so a
 * lead who arrives from LinkedIn today but converts on a later direct visit
 * still gets credited to LinkedIn instead of falling back to "(direct)".
 *
 * Model: last known marketing touch. A plain direct/internal visit never
 * overwrites a previously captured channel; only a fresh UTM link or a
 * recognized referrer does.
 */
@Injectable({ providedIn: 'root' })
export class AttributionService {
  /** Called once at app startup. */
  init(): void {
    if (typeof window === 'undefined') return;

    const detected = this.detectAttribution();
    if (detected) {
      this.store(detected);
    } else if (!this.readStored()) {
      this.store({ source: '(direct)', medium: '(none)' });
    }
  }

  /** Returns the last known marketing-channel attribution for this visitor, if any. */
  get(): Attribution | null {
    return this.readStored();
  }

  private detectAttribution(): Attribution | null {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');

    if (utmSource) {
      return {
        source: utmSource,
        medium: params.get('utm_medium') ?? '(not set)',
        campaign: params.get('utm_campaign') ?? undefined,
        content: params.get('utm_content') ?? undefined,
      };
    }

    const referrer = document.referrer;
    if (!referrer) return null;

    try {
      const referrerHost = new URL(referrer).hostname;
      if (referrerHost === window.location.hostname) return null; // internal navigation

      const rule = REFERRER_RULES.find((r) => r.pattern.test(referrerHost));
      return rule ? { source: rule.source, medium: rule.medium } : { source: referrerHost, medium: 'referral' };
    } catch {
      return null;
    }
  }

  private readStored(): Attribution | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as StoredAttribution;
      if (!parsed?.attribution || !parsed.timestamp) return null;

      if (Date.now() - parsed.timestamp > NINETY_DAYS_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed.attribution;
    } catch {
      return null;
    }
  }

  private store(attribution: Attribution): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const payload: StoredAttribution = { attribution, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage unavailable (private browsing) — attribution just won't persist.
    }
  }
}
