import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { DeveloperProfilesService } from '../developer-profiles';

const PROFILES_SHOWN = 3;

@Component({
  selector: 'app-developer-profiles-section',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './developer-profiles-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeveloperProfilesSection {
  readonly #analytics = inject(AnalyticsService);
  readonly #developerProfiles = inject(DeveloperProfilesService);

  protected readonly isLoading = this.#developerProfiles.isLoading;
  protected readonly hasError = this.#developerProfiles.hasError;
  protected readonly profiles = computed(() =>
    this.#developerProfiles.profiles().slice(0, PROFILES_SHOWN),
  );

  protected trackCta(label: CtaLabel): void {
    this.#analytics.trackCtaClick(label);
  }

  protected splitList(value: string): string[] {
    if (!value) return [];
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  protected isAvailableNow(availability: string): boolean {
    return /now|acum|imediat|sofort/i.test(availability ?? '');
  }
}
