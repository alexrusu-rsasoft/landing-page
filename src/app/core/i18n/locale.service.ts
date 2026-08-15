import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';
import { SKIP_AUTH_INTERCEPTOR } from '../auth.interceptor';

const GERMAN_SPEAKING_COUNTRY_CODES = new Set(['DE', 'AT', 'CH', 'LI']);
const ROMANIAN_COUNTRY_CODE = 'RO';
const STORAGE_KEY = 'rsa-soft-lang';
const GEO_IP_ENDPOINT = 'https://ipwho.is/';
// Kept short because this blocks the app's very first render (see
// initLocale/appInitializer): typical geo-IP responses land well under this,
// and a slow/unreachable lookup should fall back fast rather than stall FCP.
const GEO_IP_TIMEOUT_MS = 600;

interface GeoIpResponse {
  success?: boolean;
  country_code?: string;
}

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly http = inject(HttpClient);
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  async initLocale(): Promise<void> {
    this.transloco.langChanges$.subscribe((lang) => this.syncHtmlLang(lang));

    const storedLang = this.readStoredLang();
    if (storedLang) {
      await this.activateLang(storedLang);
      return;
    }

    const countryCode = await this.detectCountryCode();
    const lang = this.resolveLang(countryCode);
    await this.activateLang(lang);
    this.storeLang(lang);
  }

  /**
   * Loads the translation file before activating it so the first render
   * already has real copy — avoids a pop-in reflow once the async
   * translation JSON arrives after bootstrap (was causing large CLS).
   */
  private async activateLang(lang: string): Promise<void> {
    await firstValueFrom(this.transloco.load(lang).pipe(catchError(() => of(null))));
    this.transloco.setActiveLang(lang);
  }

  private syncHtmlLang(lang: string): void {
    this.document.documentElement.lang = lang;
  }

  private async detectCountryCode(): Promise<string | null> {
    const response = await firstValueFrom(
      this.http
        .get<GeoIpResponse>(GEO_IP_ENDPOINT, {
          context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true),
        })
        .pipe(
          timeout(GEO_IP_TIMEOUT_MS),
          catchError(() => of(null)),
        ),
    );
    if (!response || response.success === false) return null;
    return response.country_code ?? null;
  }

  private resolveLang(countryCode: string | null): string {
    if (!countryCode) {
      return this.resolveLangFromBrowser();
    }

    const normalized = countryCode.toUpperCase();
    if (GERMAN_SPEAKING_COUNTRY_CODES.has(normalized)) return 'de';
    if (normalized === ROMANIAN_COUNTRY_CODE) return 'ro';
    return 'en';
  }

  private resolveLangFromBrowser(): string {
    const browserLang = (navigator.language || 'en').toLowerCase();
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('ro')) return 'ro';
    return 'en';
  }

  private readStoredLang(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private storeLang(lang: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage unavailable (private browsing, disabled cookies). Non-fatal.
    }
  }
}
