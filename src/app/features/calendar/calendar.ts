import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../core/analytics.service';

const CALENDAR_BASE_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3PggS-kWzLqcvgiPYcwZyYi3YANL3y07u8ilKk5ZXJQsR7n_sKPfPO6cy-nXafhJ41PtPVMilL';

@Component({
  selector: 'app-calendar',
  imports: [TranslocoPipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  readonly #analytics = inject(AnalyticsService);
  readonly #transloco = inject(TranslocoService);
  readonly #sanitizer = inject(DomSanitizer);

  readonly #activeLang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });

  readonly calendarSrc = computed<SafeResourceUrl>(() =>
    this.#sanitizer.bypassSecurityTrustResourceUrl(
      `${CALENDAR_BASE_URL}?gv=true&hl=${encodeURIComponent(this.#activeLang())}`,
    ),
  );

  protected onCalendarLoad(): void {
    this.#analytics.trackCalendarIframeLoaded();
  }
}
