import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { AnalyticsService } from '../../../core/analytics.service';
import { CONTACT_ALTERNATIVES } from './contact-alternatives.config';
import { ViewportScroller } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact implements AfterViewInit, OnDestroy {
  readonly #analytics = inject(AnalyticsService);
  readonly #viewportScroller = inject(ViewportScroller);
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly calendarIfremRef = viewChild<ElementRef<HTMLIFrameElement>>('calendarIframe');

  readonly #screenState = toSignal(
    this.#breakpointObserver.observe([
      '(max-width: 390px)', // iPhone 12
      '(max-width: 430px)', // iPhone 14 Pro Max
    ]),
  );

  protected readonly CONTACT_ALTERNATIVES = CONTACT_ALTERNATIVES;
  readonly #calendarViewed = signal(false);
  readonly #calendarEngaged = signal(false);
  #intersectionObserver?: IntersectionObserver;
  readonly #onWindowBlur = (): void => this.handleWindowBlur();

  readonly iframeHeight = computed(() => {
    const state = this.#screenState();

    if (state?.breakpoints['(max-width: 390px)']) {
      return '175vh'; // iPhone 12
    }

    if (state?.breakpoints['(max-width: 430px)']) {
      return '150vh'; // iPhone 14 Pro Max
    }

    return '100vh'; // MacBook Pro 16" și ecrane mari
  });

  ngAfterViewInit(): void {
    this.#viewportScroller.scrollToAnchor('contact');
    this.setupIntersectionObserver();
    window.addEventListener('blur', this.#onWindowBlur);
  }

  ngOnDestroy(): void {
    this.#intersectionObserver?.disconnect();
    window.removeEventListener('blur', this.#onWindowBlur);
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

    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.#calendarViewed()) {
          this.#calendarViewed.set(true);
          this.#analytics.trackCalendarViewed();
          this.#intersectionObserver?.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    this.#intersectionObserver.observe(iframe);
  }

  /**
   * When the window loses focus the user has clicked into the cross-origin
   * iframe. We guard with `calendarViewed` so we only fire this if the
   * calendar section was actually visible (avoids false positives from
   * other browser blur events like alt-tab).
   */
  private handleWindowBlur(): void {
    if (this.#calendarViewed() && !this.#calendarEngaged()) {
      this.#calendarEngaged.set(true);
      this.#analytics.trackCalendarEngaged();
    }
  }
}
