import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService } from '../../../core/analytics.service';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { TrackSectionViewDirective } from '../../../shared/analytics/track-section-view.directive';
import {
  ALL_PHOTOS,
  ASIDE_ROW,
  BOOKS,
  BOTTOM_ROWS,
  FEATURE_PHOTO,
  HOBBIES,
  HumanBehindPhoto,
} from './human-behind-data';

/** Minimum horizontal travel (px) for a touch gesture in the lightbox to count as a swipe. */
const SWIPE_THRESHOLD_PX = 50;

/**
 * "The human behind the code" on /work-with-alex: a portrait beside a personal
 * note and emoji interest tiles, uncropped photos in justified rows (each opens in a
 * lightbox), a bookshelf and a closing call invitation for visitors who read
 * this far. Every part reports to GA4 (section views, photo views, CTA).
 */
@Component({
  selector: 'app-human-behind',
  imports: [NgTemplateOutlet, TranslocoPipe, FreeCallCta, RevealOnScrollDirective, TrackSectionViewDirective],
  templateUrl: './human-behind.html',
  styleUrl: './human-behind.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HumanBehind {
  readonly featurePhoto = FEATURE_PHOTO;
  readonly asideRow = ASIDE_ROW;
  readonly bottomRows = BOTTOM_ROWS;
  readonly hobbies = HOBBIES;
  readonly books = BOOKS;
  readonly photoCount = ALL_PHOTOS.length;

  private readonly analytics = inject(AnalyticsService);
  private readonly document = inject(DOCUMENT);
  private readonly lightbox = viewChild.required<ElementRef<HTMLDialogElement>>('lightbox');

  protected readonly activeIndex = signal<number | null>(null);
  protected readonly activePhoto = computed(() => {
    const index = this.activeIndex();
    return index === null ? null : ALL_PHOTOS[index];
  });

  private viewedInSession = new Set<string>();
  private touchStartX: number | null = null;

  protected srcset(photo: HumanBehindPhoto, ext: 'avif' | 'webp'): string {
    return photo.srcsetWidths.map((w) => `/human-behind/${photo.name}-${w}.${ext} ${w}w`).join(', ');
  }

  /** Second-smallest width as the plain src for browsers that ignore srcset. */
  protected fallbackSrc(photo: HumanBehindPhoto): string {
    return `/human-behind/${photo.name}-${photo.srcsetWidths[1]}.webp`;
  }

  /** The lightbox image is bounded by 92vw and 80vh, so whichever binds first decides the width. */
  protected lightboxSizes(photo: HumanBehindPhoto): string {
    return `min(92vw, ${(80 * photo.ratio).toFixed(1)}vh)`;
  }

  protected open(photo: HumanBehindPhoto): void {
    this.viewedInSession = new Set();
    this.show(ALL_PHOTOS.indexOf(photo), 'click');
    this.document.body.style.overflow = 'hidden';
    this.lightbox().nativeElement.showModal();
  }

  protected step(direction: 1 | -1): void {
    const index = this.activeIndex();
    if (index === null) return;
    this.show((index + direction + ALL_PHOTOS.length) % ALL_PHOTOS.length, direction === 1 ? 'next' : 'prev');
  }

  protected close(): void {
    this.lightbox().nativeElement.close();
  }

  /** Runs for every way the dialog closes: button, Escape, backdrop click. */
  protected onClosed(): void {
    this.document.body.style.overflow = '';
    this.analytics.trackLightboxClose(this.viewedInSession.size);
    this.activeIndex.set(null);
  }

  /** The dialog fills the screen, so a click that lands on the dialog itself is a click on the backdrop. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.lightbox().nativeElement) this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
  }

  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0]?.clientX ?? null;
  }

  protected onTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0]?.clientX;
    if (this.touchStartX === null || endX === undefined) return;
    const deltaX = endX - this.touchStartX;
    this.touchStartX = null;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) this.step(deltaX < 0 ? 1 : -1);
  }

  private show(index: number, via: 'click' | 'next' | 'prev'): void {
    const photo = ALL_PHOTOS[index];
    this.activeIndex.set(index);
    this.viewedInSession.add(photo.name);
    this.analytics.trackPhotoView(photo.name, via);
  }
}
