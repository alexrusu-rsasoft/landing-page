import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CareersService } from '../careers';
import { CareerOpening } from '../career-opening';

const APPLY_EMAIL = 'alex.rusu@rsasoft.ro';

@Component({
  selector: 'app-careers-page',
  imports: [RouterLink, TranslocoPipe],
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

  protected trackCta(label: CtaLabel): void {
    this.#analytics.trackCtaClick(label);
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

  protected applyHref(opening: CareerOpening): string {
    const subject = this.#transloco.translate('careers.openings.applySubject', {
      opportunity: opening.opportunity,
    });
    const body = this.#transloco.translate('careers.openings.applyBody', {
      opportunity: opening.opportunity,
    });
    return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  protected trackApply(opening: CareerOpening): void {
    this.#analytics.trackCareersApplyClick(opening.opportunity);
  }

  protected get generalApplyHref(): string {
    const subject = this.#transloco.translate('careers.finalCta.subject');
    return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}`;
  }
}
