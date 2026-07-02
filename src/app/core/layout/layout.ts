import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnalyticsService, CtaLabel } from '../analytics.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  readonly #analytics = inject(AnalyticsService);

  readonly currentYear = new Date().getFullYear();
  protected readonly mobileMenuOpen = signal(false);

  protected trackCta(label: CtaLabel): void {
    this.#analytics.trackCtaClick(label);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
