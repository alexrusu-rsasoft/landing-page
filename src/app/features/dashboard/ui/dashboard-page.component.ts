import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { Contact } from '../../../shared/ui/contact/contact';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, RouterOutlet, Contact],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  readonly currentYear = new Date().getFullYear();

  protected readonly mobileMenuOpen = signal(false);

  private readonly analytics = inject(AnalyticsService);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected trackCta(label: CtaLabel): void {
    this.analytics.trackCtaClick(label);
  }

  protected trackContact(label: string): void {
    this.analytics.trackContactClick(label as never);
  }
}
