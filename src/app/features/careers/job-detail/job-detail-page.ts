import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';
import { AnalyticsSection, AnalyticsService } from '../../../core/analytics.service';
import { CareersApplyForm } from '../apply/careers-apply-form/careers-apply-form';
import { CareersApplyModal } from '../careers-apply-modal.service';
import { CareerOpening } from '../career-opening';
import { CareersService } from '../careers';
import { JobNotesBlock, parseJobNotes } from '../job-notes';
import { slugifyOpportunity } from '../job-slug';

@Component({
  selector: 'app-job-detail-page',
  imports: [RouterLink, TranslocoPipe, CareersApplyForm],
  templateUrl: './job-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetailPage {
  readonly #route = inject(ActivatedRoute);
  readonly #careers = inject(CareersService);
  readonly #analytics = inject(AnalyticsService);
  readonly #transloco = inject(TranslocoService);
  readonly #pageTitle = inject(Title);
  readonly #applyModal = inject(CareersApplyModal);

  protected readonly slug = toSignal(
    this.#route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.#route.snapshot.paramMap.get('slug') ?? '' },
  );

  protected readonly isLoading = this.#careers.isLoading;
  protected readonly hasError = this.#careers.hasError;
  protected readonly openings = this.#careers.openings;

  protected readonly opening = computed<CareerOpening | null>(
    () => this.openings().find((o) => slugifyOpportunity(o.opportunity) === this.slug()) ?? null,
  );

  protected readonly notFound = computed(
    () => !this.isLoading() && !this.hasError() && !this.opening(),
  );

  protected readonly noteBlocks = computed<JobNotesBlock[]>(() => {
    const current = this.opening();
    return current ? parseJobNotes(current.notes, current.opportunity) : [];
  });

  protected readonly otherOpenings = computed(() => {
    const current = this.opening();
    return this.openings()
      .filter((o) => o !== current)
      .slice(0, 3);
  });

  protected readonly applyOpen = this.#applyModal.isOpen;
  protected readonly shareState = signal<'idle' | 'copied'>('idle');

  #viewTracked = new Set<string>();

  constructor() {
    effect(() => {
      const current = this.opening();
      this.#pageTitle.setTitle(
        current ? `${current.opportunity} | RSA SOFT` : this.#transloco.translate('meta.careers') + ' | RSA SOFT',
      );

      if (current && !this.#viewTracked.has(current.opportunity)) {
        this.#viewTracked.add(current.opportunity);
        this.#analytics.trackJobView(current.opportunity);
      }
    });
  }

  protected jobLink(opening: CareerOpening): string[] {
    return ['/careers', slugifyOpportunity(opening.opportunity)];
  }

  protected isUrgent(opening: CareerOpening): boolean {
    return /urgent/i.test(opening.urgency ?? '');
  }

  // Sheet values are usually numeric ("5", "3; 4") but occasionally free text
  // ("Several years"). Only wrap the numeric ones in the "X+ yrs" translation.
  protected yearsLabel(opening: CareerOpening): string {
    const value = opening.minYearsExperience;
    if (/^[\d.,;\s-]+$/.test(value)) {
      return this.#transloco.translate('careers.openings.yearsLabel', { years: value });
    }
    return value;
  }

  /** Opens the form for this role: `careers_job_<section>_apply_click`, labelled with the role. */
  protected apply(section: AnalyticsSection): void {
    const opportunity = this.opening()?.opportunity ?? '';
    this.#applyModal.open(opportunity, section);
    this.#analytics.trackClick(section, 'apply', opportunity);
  }

  /** The roles failed to load, so the page offers the general form instead: `careers_job_error_send_profile_click`. */
  protected sendProfile(): void {
    this.#applyModal.open('', 'error');
    this.#analytics.trackClick('error', 'send_profile');
  }

  protected closeApply(): void {
    this.applyOpen.set(false);
  }

  protected async share(): Promise<void> {
    const current = this.opening();
    if (!current) return;

    if (navigator.share) {
      this.#analytics.trackClick('header', 'share', current.opportunity, {
        method: 'native_share',
      });
      try {
        await navigator.share({ title: current.opportunity, url: this.#shareUrl(current, 'native_share') });
      } catch {
        // Share sheet dismissed or unsupported mid-call: nothing more to do.
      }
      return;
    }

    this.#analytics.trackClick('header', 'share', current.opportunity, { method: 'copy_link' });
    try {
      await navigator.clipboard.writeText(this.#shareUrl(current, 'copy_link'));
      this.shareState.set('copied');
      setTimeout(() => this.shareState.set('idle'), 2000);
    } catch {
      // Clipboard unavailable (permissions, insecure context): fail silently.
    }
  }

  /**
   * Builds the shared link from the clean role URL (dropping any UTMs the
   * sharer arrived with) so every visit it brings lands in GA as
   * source=job_share / campaign=careers, with the role slug as utm_content.
   */
  #shareUrl(opening: CareerOpening, medium: 'native_share' | 'copy_link'): string {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set('utm_source', 'job_share');
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', 'careers');
    url.searchParams.set('utm_content', slugifyOpportunity(opening.opportunity));
    return url.toString();
  }
}
