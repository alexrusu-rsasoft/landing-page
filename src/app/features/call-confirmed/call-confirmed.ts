import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, type ContactLabel } from '../../core/analytics.service';
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

  protected readonly emailChannel = CONTACT_ALTERNATIVES.find((c) => c.id === 'contact_email')!;
  protected readonly whatsappChannel = CONTACT_ALTERNATIVES.find(
    (c) => c.id === 'contact_whatsapp',
  )!;

  protected trackReschedule(): void {
    this.#analytics.trackCtaClick('call_confirmed_reschedule');
  }

  protected trackContact(label: ContactLabel): void {
    this.#analytics.trackContactClick(label);
  }
}
