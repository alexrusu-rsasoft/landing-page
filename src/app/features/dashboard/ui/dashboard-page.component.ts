import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsCta, AnalyticsSection, AnalyticsService } from '../../../core/analytics.service';
import { TrackSectionViewDirective } from '../../../shared/analytics/track-section-view.directive';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { DeveloperProfilesSection } from '../../developer-profiles/developer-profiles-section/developer-profiles-section';
import { HeroCarousel } from '../hero/hero-carousel';
import { LeadMagnetSection } from '../lead-magnet/lead-magnet-section';

/** Built end to end by us, or a placement in a client's team; drives the card style. */
type EngagementModel = 'project' | 'team';

/**
 * The project cards under the featured case, with our own SaaS product
 * first. Copy for each card lives under
 * `dashboard.projects.rows.<key>`, with client names left out; the stack is
 * the same in every language, so it lives here. `cashflow` is a colleague's
 * placement through RSA SOFT; the rest come from Alex's experience sheet, the
 * same one /work-with-alex reads live.
 */
const PROJECT_ROWS: readonly { key: string; model: EngagementModel; stack: readonly string[] }[] = [
  { key: 'invoicing', model: 'project', stack: ['Angular', 'NestJS'] },
  { key: 'cashflow', model: 'team', stack: ['Angular'] },
  { key: 'payments', model: 'team', stack: ['Angular 18', 'Spring Boot', 'Docker'] },
  { key: 'tax', model: 'team', stack: ['Angular 16', 'PrimeNG', 'Elasticsearch'] },
  { key: 'theming', model: 'team', stack: ['Angular', 'Material', 'Jest', 'Cypress'] },
  { key: 'advisory', model: 'team', stack: ['Jira', 'GitLab CI', 'Figma'] },
  { key: 'sales', model: 'team', stack: ['Angular', '.NET Core', 'SQL Server'] },
];

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DeveloperProfilesSection,
    FreeCallCta,
    HeroCarousel,
    LeadMagnetSection,
    RouterLink,
    TranslocoPipe,
    RevealOnScrollDirective,
    TrackSectionViewDirective,
  ],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly projectRows = PROJECT_ROWS;

  private readonly analytics = inject(AnalyticsService);

  protected trackClick(section: AnalyticsSection, cta: AnalyticsCta): void {
    this.analytics.trackClick(section, cta);
  }
}
