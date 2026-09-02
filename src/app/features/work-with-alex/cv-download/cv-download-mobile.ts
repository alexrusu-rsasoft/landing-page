import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { CvDownloadService } from './cv-download.service';

/**
 * Floating "download CV" bubble + fullscreen modal for viewports below
 * `xl`, where the sticky banner (CvDownloadBanner) is hidden — there isn't
 * enough header room on phones/tablets for a permanent sticky bar.
 */
@Component({
  selector: 'app-cv-download-mobile',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './cv-download-mobile.html',
  styles: `
    :host {
      display: block;
    }
    @media (min-width: 1280px) {
      :host {
        display: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvDownloadMobile {
  protected readonly cv = inject(CvDownloadService);
  readonly #platformId = inject(PLATFORM_ID);

  protected readonly modalOpen = signal(false);

  private readonly bubbleButton = viewChild<ElementRef<HTMLButtonElement>>('bubbleButton');
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  protected onSubmit(): void {
    this.cv.onSubmit();
  }

  protected openModal(): void {
    this.modalOpen.set(true);
    if (isPlatformBrowser(this.#platformId)) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => this.closeButton()?.nativeElement.focus());
    }
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    if (isPlatformBrowser(this.#platformId)) {
      document.body.style.overflow = '';
      this.bubbleButton()?.nativeElement.focus();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.modalOpen()) this.closeModal();
  }
}
