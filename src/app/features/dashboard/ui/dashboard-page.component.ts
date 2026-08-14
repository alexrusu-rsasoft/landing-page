import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { Certifications } from '../../work-with-alex/certifications/certifications';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, Certifications, TranslocoPipe],
  templateUrl: './dashboard-page.component.html',
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
