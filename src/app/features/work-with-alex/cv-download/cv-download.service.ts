import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { AnalyticsService } from '../../../core/analytics.service';
import { LeadMagnetApi } from '../../dashboard/lead-magnet/lead-magnet-api';
import { buildCvPdfBlob } from './cv-pdf-builder';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAPTURE_ROOT_ID = 'cv-capture-root';

/**
 * Shared state + logic for the CV email-gate, used by both the desktop
 * sticky banner and the mobile floating-bubble modal so the two surfaces
 * never fall out of sync (e.g. resizing mid-flow, or submitting on one and
 * checking the other).
 */
@Injectable({ providedIn: 'root' })
export class CvDownloadService {
  readonly #transloco = inject(TranslocoService);
  readonly #analytics = inject(AnalyticsService);
  readonly #api = inject(LeadMagnetApi);
  readonly #platformId = inject(PLATFORM_ID);
  readonly #document = inject(DOCUMENT);

  readonly #activeLang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });

  readonly email = signal('');
  /** Honeypot: hidden from real visitors, only bots that autofill every field populate it. */
  readonly company = signal('');
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly showError = signal(false);
  readonly generating = signal(false);

  onSubmit(): void {
    if (this.company().trim()) {
      // Bot tripped the honeypot: show success without submitting or tracking,
      // so the bot has no signal that anything was rejected.
      this.submitted.set(true);
      return;
    }

    const email = this.email().trim();
    if (!EMAIL_PATTERN.test(email)) {
      this.showError.set(true);
      return;
    }

    this.showError.set(false);
    this.submitting.set(true);

    this.#api
      .submitLead({ email, lang: this.#activeLang(), source: 'work_with_alex_cv' })
      .subscribe({
        next: () => this.handleSubmitted(),
        error: () => this.handleSubmitted(),
      });
  }

  async downloadCv(): Promise<void> {
    if (!isPlatformBrowser(this.#platformId) || this.generating()) return;

    const root = this.#document.getElementById(CAPTURE_ROOT_ID);
    if (!root) return;

    this.generating.set(true);
    try {
      await this.#ensureImagesLoaded(root);

      const blob = await buildCvPdfBlob(root);
      const url = URL.createObjectURL(blob);
      const anchor = this.#document.createElement('a');
      anchor.href = url;
      anchor.download = 'alex-rusu-cv.pdf';
      anchor.click();
      URL.revokeObjectURL(url);
      this.#analytics.trackCvDownload(this.#activeLang());
    } finally {
      this.generating.set(false);
    }
  }

  /** Lazy-loaded images below the fold may not have finished fetching yet; force them so the capture isn't blank. */
  async #ensureImagesLoaded(root: HTMLElement): Promise<void> {
    const images = Array.from(root.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        img.loading = 'eager';
        return img.complete ? Promise.resolve() : img.decode().catch(() => undefined);
      }),
    );
  }

  private handleSubmitted(): void {
    this.submitting.set(false);
    this.submitted.set(true);
    this.#analytics.trackCvLeadSubmit();
    void this.downloadCv();
  }
}
