import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { OffersService } from '../../../core/offers/offers.service';

const HOURS_MIN = 10;
const HOURS_MAX = 400;
const RATE_MIN = 5;
const RATE_MAX = 100;

/**
 * Lets a visitor drag the two levers of the billing model (hours, developer
 * rate) and see the live total, so the "salary + margin" claim in the copy
 * above becomes something they can check themselves. The margin itself is
 * the platform's first offer, fetched app-wide at startup by OffersService.
 */
@Component({
  selector: 'app-cost-calculator',
  host: { class: 'block' },
  template: `
    <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <h3 class="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{{ title() }}</h3>
      <p class="mt-2 text-sm text-slate-500">{{ hint() }}</p>

      <div class="mt-6 grid gap-6 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">{{ hoursLabel() }}</span>
          <input type="range" [min]="hoursMin" [max]="hoursMax" step="5" [value]="hours()"
            (input)="onHoursInput($event)" class="mt-3 w-full accent-primary" />
          <div class="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{{ hoursMin }}h</span>
            <input type="number" [min]="hoursMin" [max]="hoursMax" [value]="hours()" (input)="onHoursInput($event)"
              class="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm font-semibold tabular-nums text-slate-950" />
            <span>{{ hoursMax }}h</span>
          </div>
        </label>

        <label class="block">
          <span class="text-sm font-medium text-slate-700">{{ rateLabel() }}</span>
          <input type="range" [min]="rateMin" [max]="rateMax" step="1" [value]="rate()"
            (input)="onRateInput($event)" class="mt-3 w-full accent-primary" />
          <div class="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{{ rateMin }}€</span>
            <input type="number" [min]="rateMin" [max]="rateMax" [value]="rate()" (input)="onRateInput($event)"
              class="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm font-semibold tabular-nums text-slate-950" />
            <span>{{ rateMax }}€</span>
          </div>
        </label>
      </div>

      <div class="mt-8 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ rateLabel() }}</p>
          <p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{{ rate() }} €/h</p>
        </div>
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ marginLabel() }}</p>
          @if (offersLoading()) {
          <div class="skeleton-pulse mt-2 h-6 w-16" aria-hidden="true"></div>
          } @else {
          <p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{{ margin() }} €/h</p>
          }
        </div>
        <div class="rounded-2xl bg-primary/10 p-4">
          <p class="text-xs uppercase tracking-wide text-primary">{{ perHourLabel() }}</p>
          @if (offersLoading()) {
          <div class="skeleton-pulse mt-2 h-6 w-16" aria-hidden="true"></div>
          } @else {
          <p class="mt-1 text-lg font-semibold tabular-nums text-primary">{{ perHourTotal() }} €/h</p>
          }
        </div>
      </div>

      <div class="mt-6 flex items-baseline justify-between gap-4 rounded-2xl bg-slate-950/95 px-6 py-5 text-white">
        <span class="text-sm text-slate-300">{{ totalLabel() }}</span>
        @if (offersLoading()) {
        <div class="skeleton-pulse h-9 w-24" aria-hidden="true"></div>
        } @else {
        <span class="text-3xl font-semibold tabular-nums">{{ total() }} €</span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostCalculator {
  readonly title = input.required<string>();
  readonly hint = input.required<string>();
  readonly hoursLabel = input.required<string>();
  readonly rateLabel = input.required<string>();
  readonly marginLabel = input.required<string>();
  readonly perHourLabel = input.required<string>();
  readonly totalLabel = input.required<string>();

  protected readonly hoursMin = HOURS_MIN;
  protected readonly hoursMax = HOURS_MAX;
  protected readonly rateMin = RATE_MIN;
  protected readonly rateMax = RATE_MAX;
  readonly #offers = inject(OffersService);
  protected readonly margin = this.#offers.platformCut;
  protected readonly offersLoading = this.#offers.isLoading;

  protected readonly hours = signal(60);
  protected readonly rate = signal(10);

  protected readonly perHourTotal = computed(() => this.rate() + this.margin());
  protected readonly total = computed(() => this.perHourTotal() * this.hours());

  protected onHoursInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.hours.set(Math.min(this.hoursMax, Math.max(this.hoursMin, value)));
    }
  }

  protected onRateInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.rate.set(Math.min(this.rateMax, Math.max(this.rateMin, value)));
    }
  }
}
