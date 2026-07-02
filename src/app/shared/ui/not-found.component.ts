import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="rounded-3xl p-8 text-center">
      <h2 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl text-center">
        Page not found
      </h2>
      <h3 class="mt-3">The route you requested could not be resolved.</h3>
      <a
        [routerLink]="['/']"
        class="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-slate-950"
      >
        Get a FREE consulting call
      </a>
    </section>
  `,
})
export class NotFoundComponent {}
