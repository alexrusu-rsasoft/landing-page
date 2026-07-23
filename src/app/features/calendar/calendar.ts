import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AnalyticsService } from '../../core/analytics.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  readonly #analytics = inject(AnalyticsService);

  protected onCalendarLoad(): void {
    this.#analytics.trackCalendarIframeLoaded();
  }
}
