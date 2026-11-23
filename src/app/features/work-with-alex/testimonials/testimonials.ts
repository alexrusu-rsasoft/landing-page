import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { AnalyticsService } from '../../../core/analytics.service';

/**
 * A LinkedIn recommendation shown as the original screenshot, for authenticity.
 * The images in public/testimonials have the reviewer's name, photo and company blurred,
 * plus any client or employer named in the text. No names anywhere on the page.
 */
interface Screenshot {
  kind: 'screenshot';
  /** Key under workWithAlex.testimonials.items: its quote is the alt text and the phone fallback. */
  id: string;
  src: string;
  width: number;
  height: number;
}

/**
 * Feedback that exists only as words said in a call, from someone under NDA. Drawn in the same
 * layout as the LinkedIn screenshots, with a made-up blurred photo and a blurred name, but without
 * LinkedIn's badges, since it isn't a LinkedIn recommendation.
 */
interface Written {
  kind: 'written';
  id: string;
  headline: string;
  relation: string;
  /** Kept in the original English, like the screenshots around it. */
  text: string;
}

export type Testimonial = Screenshot | Written;

const CLIENTS: readonly Testimonial[] = [
  { kind: 'screenshot', id: 'clientFounder', src: '/testimonials/client-founder.webp', width: 783, height: 191 },
  {
    kind: 'written',
    id: 'productOwner',
    headline: 'Product Owner at',
    relation: 'was Alex’s client',
    text:
      'Thank you in any case for your support, for your quick reaction, for the cool UI that you co-developed – ' +
      'actually, that you developed mostly. We’ll definitely meet again, I am sure. ' +
      'Thank you for your work, we’ll stay in touch.',
  },
];

/** Shown one at a time in a carousel, so four long recommendations don't take a screen each. */
const COLLEAGUES: readonly Testimonial[] = [
  { kind: 'screenshot', id: 'reportedColleague', src: '/testimonials/colleague-reported.webp', width: 776, height: 321 },
  { kind: 'screenshot', id: 'fullstackColleague', src: '/testimonials/colleague-fullstack.webp', width: 784, height: 222 },
  { kind: 'screenshot', id: 'angularColleague', src: '/testimonials/colleague-angular.webp', width: 782, height: 172 },
  { kind: 'screenshot', id: 'backendColleague', src: '/testimonials/colleague-backend.webp', width: 775, height: 467 },
];

@Component({
  selector: 'app-testimonials',
  imports: [TranslocoPipe, RevealOnScrollDirective, NgTemplateOutlet],
  templateUrl: './testimonials.html',
  host: { '(window:resize)': 'measure()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsSection {
  readonly #analytics = inject(AnalyticsService);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly clients = CLIENTS;
  readonly colleagues = COLLEAGUES;
  /** Colleague slide currently in view. */
  readonly active = signal(0);
  /** Height of the slide in view, so a short recommendation doesn't leave the tallest one's gap below it. */
  readonly height = signal<number | null>(null);

  constructor() {
    afterNextRender(() => this.measure());
  }

  measure(): void {
    const slide = this.track().nativeElement.children[this.active()] as HTMLElement | undefined;
    if (slide) this.height.set(slide.offsetHeight);
  }

  onScroll(): void {
    const track = this.track().nativeElement;
    const slides = Array.from(track.children) as HTMLElement[];
    // The slide whose left edge is closest to the track's scroll position
    let closest = 0;
    slides.forEach((slide, i) => {
      if (Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[closest].offsetLeft - track.scrollLeft)) {
        closest = i;
      }
    });
    if (closest !== this.active()) {
      this.active.set(closest);
      this.measure();
    }
  }

  go(step: 1 | -1): void {
    const next = Math.min(Math.max(this.active() + step, 0), this.colleagues.length - 1);
    const slide = this.track().nativeElement.children[next] as HTMLElement | undefined;
    if (!slide) return;
    this.track().nativeElement.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    this.active.set(next);
    this.measure();
    this.#analytics.trackClick('testimonials', step > 0 ? 'next' : 'prev', this.colleagues[next].id);
  }
}
