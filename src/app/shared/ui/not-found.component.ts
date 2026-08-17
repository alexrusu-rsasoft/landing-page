import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-3xl p-8 text-center">
      <h1 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl text-center">
        {{ 'notFound.title' | transloco }}
      </h1>
      <p class="mt-3">{{ 'notFound.message' | transloco }}</p>
      <a
        [routerLink]="['/']"
        class="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-slate-950"
      >
        {{ 'common.freeCallCta' | transloco }}
      </a>
    </section>
  `,
})
export class NotFoundComponent {}
