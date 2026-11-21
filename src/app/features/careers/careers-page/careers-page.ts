import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsCta, AnalyticsSection, AnalyticsService } from '../../../core/analytics.service';
import { CareersApplyForm } from '../apply/careers-apply-form/careers-apply-form';
import { CareersApplyModal } from '../careers-apply-modal.service';
import { CareersService } from '../careers';
import { CareerOpening } from '../career-opening';
import { summarizeJobNotes } from '../job-notes';
import { filterOpenings, suggestTech } from '../job-search';
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

  protected readonly applyOpen = this.#applyModal.isOpen;
  protected readonly applyTargetRole = this.#applyModal.targetRole;

  protected readonly searchQuery = signal('');
  protected readonly filteredOpenings = computed(() => filterOpenings(this.openings(), this.searchQuery()));
  protected readonly techSuggestions = computed(() => suggestTech(this.openings()));

  #searchTrackTimer: ReturnType<typeof setTimeout> | undefined;
  #lastTrackedSearch = '';

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    // Report the term once the candidate stops typing, not on every keystroke.
    clearTimeout(this.#searchTrackTimer);
    this.#searchTrackTimer = setTimeout(() => this.#trackSearch('typed'), 1200);
  }

  protected toggleTech(tech: string): void {
    clearTimeout(this.#searchTrackTimer);
    this.searchQuery.set(this.isTechActive(tech) ? '' : tech);
    if (this.searchQuery()) this.#trackSearch('chip');
  }

  protected isTechActive(tech: string): boolean {
    return this.searchQuery().trim().toLowerCase() === tech.toLowerCase();
  }

  protected clearSearch(): void {
    clearTimeout(this.#searchTrackTimer);
    this.searchQuery.set('');
  }

  #trackSearch(method: 'typed' | 'chip'): void {
    const term = this.searchQuery().trim();
    if (!term || term === this.#lastTrackedSearch) return;
    this.#lastTrackedSearch = term;
    this.#analytics.trackCareersSearch(term, this.filteredOpenings().length, method);
  }

  protected trackClick(section: AnalyticsSection, cta: AnalyticsCta): void {
    this.#analytics.trackClick(section, cta);
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

  /**
   * Opens the general "send your profile" form: `careers_<section>_send_profile_click`.
   * `state` tells apart the fallbacks shown in place of the roles list.
   */
  protected sendProfile(section: AnalyticsSection, state?: 'error' | 'empty' | 'no_results'): void {
    this.#applyModal.open('', section);
    this.#analytics.trackClick(section, 'send_profile', state);
  }

  /** Opens the form for one role from its card: `careers_openings_apply_click`, labelled with the role. */
  protected applyTo(opportunity: string): void {
    this.#applyModal.open(opportunity, 'openings');
    this.#analytics.trackClick('openings', 'apply', opportunity);
  }

  protected closeApply(): void {
    this.#applyModal.close();
  }
}
