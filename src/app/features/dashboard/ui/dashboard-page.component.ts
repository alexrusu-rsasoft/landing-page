import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
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
