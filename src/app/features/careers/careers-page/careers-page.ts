import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CareersApplyForm } from '../apply/careers-apply-form/careers-apply-form';
import { CareersApplyModal } from '../careers-apply-modal.service';
import { CareersService } from '../careers';
import { CareerOpening } from '../career-opening';
import { summarizeJobNotes } from '../job-notes';
import { slugifyOpportunity } from '../job-slug';

@Component({
  selector: 'app-careers-page',
  imports: [RouterLink, TranslocoPipe, CareersApplyForm],
  templateUrl: './careers-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareersPage {
  readonly #analytics = inject(AnalyticsService);
  readonly #transloco = inject(TranslocoService);
  readonly #careers = inject(CareersService);
  readonly #applyModal = inject(CareersApplyModal);

  protected readonly openings = this.#careers.openings;
  protected readonly isLoading = this.#careers.isLoading;
  protected readonly hasError = this.#careers.hasError;
  protected readonly ratesLoading = this.#careers.ratesLoading;

  protected readonly applyOpen = this.#applyModal.isOpen;
  protected readonly applyTargetRole = this.#applyModal.targetRole;

  protected trackCta(label: CtaLabel): void {
    this.#analytics.trackCtaClick(label);
  }

  protected isUrgent(opening: CareerOpening): boolean {
    return /urgent/i.test(opening.urgency ?? '');
  }

  protected jobLink(opening: CareerOpening): string[] {
    return ['/careers', slugifyOpportunity(opening.opportunity)];
  }

  protected notesSummary(opening: CareerOpening): string {
    return summarizeJobNotes(opening.notes);
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

  protected openApply(targetRole = ''): void {
    this.#applyModal.open(targetRole);
    this.#analytics.trackCareersApplyClick(targetRole || 'general');
  }

  protected closeApply(): void {
    this.#applyModal.close();
  }
}
