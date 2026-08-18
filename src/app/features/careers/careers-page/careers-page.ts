import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CareersApplyForm } from '../apply/careers-apply-form/careers-apply-form';
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

  protected readonly openings = this.#careers.openings;
  protected readonly isLoading = this.#careers.isLoading;
  protected readonly hasError = this.#careers.hasError;

  protected readonly applyOpen = signal(false);
  protected readonly applyTargetRole = signal('');

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
    this.applyTargetRole.set(targetRole);
    this.applyOpen.set(true);
    this.#analytics.trackCareersApplyClick(targetRole || 'general');
  }

  protected closeApply(): void {
    this.applyOpen.set(false);
  }
}
