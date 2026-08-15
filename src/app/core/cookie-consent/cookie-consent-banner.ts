import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  viewChild,
} from '@angular/core';
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
  private readonly banner = viewChild<ElementRef<HTMLElement>>('banner');

  constructor() {
    effect(() => {
      if (this.consent.bannerVisible()) {
        requestAnimationFrame(() =>
          this.banner()?.nativeElement.querySelector<HTMLElement>('button')?.focus(),
        );
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.consent.bannerVisible()) this.consent.reject();
  }
}
