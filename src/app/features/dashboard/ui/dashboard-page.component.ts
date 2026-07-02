import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [NgFor, NgIf, RouterLink, RouterOutlet],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('calendarIframe') private calendarIframeRef!: ElementRef<HTMLIFrameElement>;

  protected readonly mobileMenuOpen = signal(false);
  protected readonly contactAlternatives = [
    {
      label: 'Phone',
      value: '+40 747 011 397',
      href: 'tel:+40747011397',
      icon: 'phone',
    },
    {
      label: 'Email',
      value: 'alex.rusu@rsasoft.ro',
      href: 'mailto:alex.rusu@rsasoft.ro',
      icon: 'mail',
    },
    {
      label: 'WhatsApp',
      value: 'Start a voice call',
      href: 'https://call.whatsapp.com/voice/DOBSnSbUllHG7cl9enmSLe',
      icon: 'whatsapp',
    },
    {
      label: 'Telegram',
      value: 'Open Telegram call',
      href: 'https://t.me/call/cEtJXUVLmmQXFDr_Tent8wQ2hB0',
      icon: 'telegram',
    },
    {
      label: 'LinkedIn',
      value: 'alexrusu-rsa',
      href: 'https://www.linkedin.com/in/alexrusu-rsa/',
      icon: 'linkedin',
    },
    {
      label: 'XING',
      value: 'Alex Rusu',
      href: 'https://www.xing.com/profile/Alex_Rusu3',
      icon: 'xing',
    },
  ];
  private readonly analytics = inject(AnalyticsService);

  private intersectionObserver?: IntersectionObserver;
  private calendarViewed = false;
  private calendarEngaged = false;
  private readonly onWindowBlur = (): void => this.handleWindowBlur();

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    window.addEventListener('blur', this.onWindowBlur);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    window.removeEventListener('blur', this.onWindowBlur);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected trackCta(label: CtaLabel): void {
    this.analytics.trackCtaClick(label);
  }

  protected onCalendarLoad(): void {
    this.analytics.trackCalendarIframeLoaded();
  }

  /**
   * Sets up an IntersectionObserver that fires `calendar_section_viewed`
   * exactly once when at least 40% of the iframe enters the viewport.
   */
  private setupIntersectionObserver(): void {
    const iframe = this.calendarIframeRef?.nativeElement;
    if (!iframe) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.calendarViewed) {
          this.calendarViewed = true;
          this.analytics.trackCalendarViewed();
          this.intersectionObserver?.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    this.intersectionObserver.observe(iframe);
  }

  /**
   * When the window loses focus the user has clicked into the cross-origin
   * iframe. We guard with `calendarViewed` so we only fire this if the
   * calendar section was actually visible (avoids false positives from
   * other browser blur events like alt-tab).
   */
  private handleWindowBlur(): void {
    if (this.calendarViewed && !this.calendarEngaged) {
      this.calendarEngaged = true;
      this.analytics.trackCalendarEngaged();
    }
  }
}
