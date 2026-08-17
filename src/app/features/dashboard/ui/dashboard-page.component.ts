import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CountUpDirective } from '../../../shared/ui/count-up/count-up.directive';
import { CountUpStat } from '../../../shared/ui/count-up/count-up-stat';
import { DeveloperProfilesSection } from '../../developer-profiles/developer-profiles-section/developer-profiles-section';
import { Certifications } from '../../work-with-alex/certifications/certifications';
import { LeadMagnetSection } from '../lead-magnet/lead-magnet-section';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    Certifications,
    DeveloperProfilesSection,
    LeadMagnetSection,
    TranslocoPipe,
    CountUpDirective,
    CountUpStat,
  ],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly mobileMenuOpen = signal(false);

  private readonly analytics = inject(AnalyticsService);

  protected trackCta(label: CtaLabel): void {
    this.analytics.trackCtaClick(label);
  }

  protected trackContact(label: string): void {
    this.analytics.trackContactClick(label as never);
  }
}
