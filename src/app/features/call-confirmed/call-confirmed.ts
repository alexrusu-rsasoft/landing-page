import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  AnalyticsService,
  type AnalyticsSection,
  type ContactChannel,
} from '../../core/analytics.service';
import { Certifications } from '../work-with-alex/certifications/certifications';
import { CONTACT_ALTERNATIVES } from '../../shared/ui/contact/contact-alternatives.config';

@Component({
  selector: 'app-call-confirmed',
  imports: [RouterLink, TranslocoPipe, Certifications],
  templateUrl: './call-confirmed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallConfirmed {
  readonly #analytics = inject(AnalyticsService);

  protected readonly emailChannel = CONTACT_ALTERNATIVES.find((c) => c.id === 'email')!;
  protected readonly whatsappChannel = CONTACT_ALTERNATIVES.find((c) => c.id === 'whatsapp')!;

  protected trackReschedule(): void {
    this.#analytics.trackClick('footer', 'reschedule');
  }

  protected trackContact(section: AnalyticsSection, channel: ContactChannel): void {
    this.#analytics.trackClick(section, channel);
  }
}
