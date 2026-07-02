import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { AnalyticsService } from '../../../core/analytics.service';
import { CONTACT_ALTERNATIVES } from './contact-alternatives.config';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact implements AfterViewInit, OnDestroy {
  readonly #analytics = inject(AnalyticsService);

  readonly calendarIfremRef = viewChild<ElementRef<HTMLIFrameElement>>('calendarIframe');

  protected readonly CONTACT_ALTERNATIVES = CONTACT_ALTERNATIVES;
  private calendarViewed = false;
  private calendarEngaged = false;
  private intersectionObserver?: IntersectionObserver;
  private readonly onWindowBlur = (): void => this.handleWindowBlur();

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    window.addEventListener('blur', this.onWindowBlur);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
    window.removeEventListener('blur', this.onWindowBlur);
  }

  protected trackContact(label: string): void {
    this.#analytics.trackContactClick(label as never);
  }

  protected onCalendarLoad(): void {
    this.#analytics.trackCalendarIframeLoaded();
  }

  /**
   * Sets up an IntersectionObserver that fires `calendar_section_viewed`
   * exactly once when at least 40% of the iframe enters the viewport.
   */
  private setupIntersectionObserver(): void {
    const iframe = this.calendarIfremRef()?.nativeElement;
    if (!iframe) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.calendarViewed) {
          this.calendarViewed = true;
          this.#analytics.trackCalendarViewed();
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
      this.#analytics.trackCalendarEngaged();
    }
  }
}
