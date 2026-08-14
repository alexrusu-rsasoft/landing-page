import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CookieConsentService } from '../../../core/cookie-consent/cookie-consent.service';

@Component({
  selector: 'app-cookie-policy',
  imports: [TranslocoPipe],
  templateUrl: './cookie-policy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiePolicy {
  protected readonly consent = inject(CookieConsentService);
}
