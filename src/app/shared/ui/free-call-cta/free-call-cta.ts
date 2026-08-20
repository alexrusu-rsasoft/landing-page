import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';

const CONFIRM_DURATION_MS = 900;

const BASE_CLASSES =
  'group relative inline-flex items-center justify-center overflow-hidden rounded-full py-4 text-sm font-semibold shadow-lg transition duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const VARIANT_CLASSES: Record<'primary' | 'invert' | 'light', string> = {
  primary: 'bg-primary text-white shadow-primary/20 hover:bg-slate-950 hover:shadow-xl focus-visible:ring-primary',
  invert: 'bg-primary text-white shadow-primary/30 hover:bg-white hover:text-slate-950 hover:shadow-xl focus-visible:ring-white',
  // For the photographic hero: a blue button would sink into the blue overlay.
  light: 'bg-white text-slate-950 shadow-slate-950/30 hover:bg-primary hover:text-white hover:shadow-xl focus-visible:ring-white focus-visible:ring-offset-transparent',
};

const SIZE_CLASSES: Record<'md' | 'lg', string> = {
  md: 'px-6',
  lg: 'px-8',
};

/**
 * The site's repeated "book a free call" button. Centralizes the hover-lift
 * micro-interaction and the brief checkmark confirmation shown on click, so
 * every occurrence gets both without re-implementing them per call site.
 */
@Component({
  selector: 'app-free-call-cta',
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/contact']" [class]="hostClasses()" (click)="onClick()">
      <span class="relative inline-flex items-center gap-2">
        <span [class.opacity-0]="confirmed()">{{ label() }}</span>
        @if (confirmed()) {
          <span class="absolute inset-0 flex items-center justify-center gap-1.5" aria-hidden="true">
            <svg class="h-4 w-4 animate-cta-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {{ confirmedLabel() }}
          </span>
        }
      </span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreeCallCta {
  readonly label = input.required<string>();
  readonly confirmedLabel = input.required<string>();
  readonly analyticsLabel = input.required<CtaLabel>();
  readonly variant = input<'primary' | 'invert' | 'light'>('primary');
  readonly size = input<'md' | 'lg'>('md');

  protected readonly confirmed = signal(false);
  protected readonly hostClasses = computed(
    () => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}`,
  );

  private readonly analytics = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected onClick(): void {
    this.analytics.trackCtaClick(this.analyticsLabel());

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.confirmed.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.confirmed.set(false), CONFIRM_DURATION_MS);
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }
}
