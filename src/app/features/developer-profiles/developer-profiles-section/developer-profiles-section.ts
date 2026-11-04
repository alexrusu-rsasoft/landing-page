import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { DeveloperProfilesService } from '../developer-profiles';

const PROFILES_SHOWN = 3;

@Component({
  selector: 'app-developer-profiles-section',
  imports: [TranslocoPipe, FreeCallCta],
  templateUrl: './developer-profiles-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-busy]': 'isLoading()' },
})
export class DeveloperProfilesSection {
  readonly #developerProfiles = inject(DeveloperProfilesService);

  protected readonly isLoading = this.#developerProfiles.isLoading;
  protected readonly hasError = this.#developerProfiles.hasError;
  protected readonly profiles = computed(() =>
    this.#developerProfiles.profiles().slice(0, PROFILES_SHOWN),
  );

  protected splitList(value: string): string[] {
    if (!value) return [];
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  /** The sheet uses "-" (or leaves the cell empty) when the years are unknown. */
  protected hasYears(years: string): boolean {
    return /\d/.test(years ?? '');
  }

  /**
   * The sheet's availability values are English free text, so the common
   * "available now" case is shown in the visitor's language instead; anything
   * else (a date, "in 2 weeks") passes through as written.
   */
  protected isAvailableNow(availability: string): boolean {
    return /immediately|now|acum|imediat|sofort/i.test(availability ?? '');
  }
}
