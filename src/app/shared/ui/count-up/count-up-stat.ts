import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, viewChild } from '@angular/core';
import { animateCountUpText } from './count-up.directive';

const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Hero stat tile with a clock icon whose ring fills, and a value whose
 * digits count up from 0, the first time it scrolls into view.
 */
@Component({
  selector: 'app-count-up-stat',
  template: `
    <div class="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/70">
      <div class="flex items-center gap-3">
        <div class="relative flex h-9 w-9 shrink-0 items-center justify-center text-primary">
          <svg class="h-9 w-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-100" />
            <circle
              #ring
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              [attr.stroke-dasharray]="circumference"
              [attr.stroke-dashoffset]="circumference"
            />
          </svg>
          <svg class="absolute h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <p class="text-sm text-slate-500">{{ label() }}</p>
      </div>
      <p #valueEl class="mt-3 text-2xl font-semibold text-slate-950">{{ value() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountUpStat {
  readonly label = input.required<string>();
  readonly value = input.required<string>();

  protected readonly circumference = CIRCUMFERENCE;

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ring = viewChild.required<ElementRef<SVGCircleElement>>('ring');
  private readonly valueEl = viewChild.required<ElementRef<HTMLElement>>('valueEl');

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const ringEl = this.ring().nativeElement;
    const valueElement = this.valueEl().nativeElement;
    const finalText = valueElement.textContent ?? '';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ringEl.setAttribute('stroke-dashoffset', '0');
      return;
    }

    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer?.disconnect();
          observer = null;
          animateCountUpText(valueElement, finalText, (eased) => {
            ringEl.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - eased)));
          });
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(this.hostRef.nativeElement);

    this.destroyRef.onDestroy(() => observer?.disconnect());
  }
}
