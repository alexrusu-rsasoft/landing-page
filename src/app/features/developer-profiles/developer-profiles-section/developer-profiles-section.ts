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

  protected isAvailableNow(availability: string): boolean {
    return /immediately|now|acum|imediat|sofort/i.test(availability ?? '');
  }
}
