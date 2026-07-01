import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-compliance-tracker-page',
  imports: [],
  template: `
    <section class="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/80">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Compliance tracker</p>
          <h2 class="mt-3 text-2xl font-semibold text-slate-950">Evidence lifecycle pipeline</h2>
          <p class="mt-3 text-slate-600">
            Domain state is expressed as signals with computed summaries for enterprise reporting.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Audit-ready</span>
            <span class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Policy aligned</span>
            <span class="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Automated</span>
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/80">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Status summary</p>
          <p class="mt-3 text-4xl font-semibold text-slate-950">{{ completionRate() }}%</p>
          <p class="mt-2 text-slate-500">{{ tasks().length }} active controls</p>
        </div>
      </div>
    </section>
  `,
})
export class ComplianceTrackerPageComponent {
  protected readonly tasks = signal([
    'Policy review',
    'Access log validation',
    'Evidence retention',
  ]);
  protected readonly completionRate = computed(() => 100 - this.tasks().length * 8);
}
