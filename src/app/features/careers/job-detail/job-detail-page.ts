import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';
import { AnalyticsService } from '../../../core/analytics.service';
import { CareersApplyForm } from '../apply/careers-apply-form/careers-apply-form';
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

  protected readonly slug = toSignal(
    this.#route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: this.#route.snapshot.paramMap.get('slug') ?? '' },
  );

  protected readonly isLoading = this.#careers.isLoading;
  protected readonly hasError = this.#careers.hasError;
  protected readonly openings = this.#careers.openings;
  protected readonly ratesLoading = this.#careers.ratesLoading;

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

  protected readonly applyOpen = signal(false);
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
        this.#analytics.trackCareersViewDetails(current.opportunity);
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

  protected openApply(): void {
    this.applyOpen.set(true);
    this.#analytics.trackCareersApplyClick(this.opening()?.opportunity ?? 'general');
  }

  protected closeApply(): void {
    this.applyOpen.set(false);
  }

  protected async share(): Promise<void> {
    const current = this.opening();
    if (!current) return;

    this.#analytics.trackCareersShare(current.opportunity);
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: current.opportunity, url });
      } catch {
        // Share sheet dismissed or unsupported mid-call: nothing more to do.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      this.shareState.set('copied');
      setTimeout(() => this.shareState.set('idle'), 2000);
    } catch {
      // Clipboard unavailable (permissions, insecure context): fail silently.
    }
  }
}
