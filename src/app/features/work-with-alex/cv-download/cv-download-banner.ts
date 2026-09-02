import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { CvDownloadService } from './cv-download.service';

/**
 * Sticky CTA banner shown under the header on large screens only (below
 * `xl` the floating bubble + fullscreen modal takes over, see
 * CvDownloadMobile). Hidden via a host media query rather than Tailwind
 * classes because :host also carries the sticky positioning.
 */
@Component({
  selector: 'app-cv-download-banner',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './cv-download-banner.html',
  styles: `
    :host {
      display: none;
    }
    @media (min-width: 1280px) {
      :host {
        /* Sticky must live on the host: an inner wrapper's containing block
           would just be this host element, which (having no other content)
           is exactly as tall as the banner itself — leaving no room to stick. */
        display: block;
        position: sticky;
        top: 77px;
        z-index: 40;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvDownloadBanner {
  protected readonly cv = inject(CvDownloadService);

  readonly dismissed = signal(false);
  /** Whether the email field has been revealed (step 2 of the desktop flow). */
  readonly showForm = signal(false);

  protected onSubmit(): void {
    this.cv.onSubmit();
  }

  protected dismiss(): void {
    this.dismissed.set(true);
  }
}
