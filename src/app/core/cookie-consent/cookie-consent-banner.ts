import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { CookieConsentService } from './cookie-consent.service';

@Component({
  selector: 'app-cookie-consent-banner',
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './cookie-consent-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentBanner {
  protected readonly consent = inject(CookieConsentService);
}
