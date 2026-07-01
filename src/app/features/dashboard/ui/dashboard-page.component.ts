import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  protected readonly mobileMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
