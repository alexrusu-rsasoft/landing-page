import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../../core/analytics.service';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { LeadMagnetApi } from './lead-magnet-api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOWNLOAD_URLS: Record<string, string> = {
  en: '/downloads/rsa-soft-quick-staffing-protocol-en.pdf',
  de: '/downloads/rsa-soft-quick-staffing-protocol-de.pdf',
  ro: '/downloads/rsa-soft-quick-staffing-protocol-ro.pdf',
};

@Component({
  selector: 'app-lead-magnet-section',
  imports: [FormsModule, TranslocoPipe, RevealOnScrollDirective],
  templateUrl: './lead-magnet-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadMagnetSection {
  readonly #transloco = inject(TranslocoService);
  readonly #analytics = inject(AnalyticsService);
  readonly #api = inject(LeadMagnetApi);

  readonly #activeLang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });

  readonly email = signal('');
  /** Honeypot: hidden from real visitors, only bots that autofill every field populate it. */
  readonly company = signal('');
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly showError = signal(false);

  readonly downloadUrl = computed(
    () => DOWNLOAD_URLS[this.#activeLang()] ?? DOWNLOAD_URLS['en'],
  );

  protected onSubmit(): void {
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
      .submitLead({ email, lang: this.#activeLang(), source: 'dashboard_lead_magnet' })
      .subscribe({
        next: () => this.handleSubmitted(),
        error: () => this.handleSubmitted(),
      });
  }

  protected trackDownload(): void {
    this.#analytics.trackLeadMagnetDownload(this.#activeLang());
  }

  private handleSubmitted(): void {
    this.submitting.set(false);
    this.submitted.set(true);
    this.#analytics.trackLeadMagnetSubmit();
  }
}
