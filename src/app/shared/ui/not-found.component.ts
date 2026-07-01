import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
      <h2 class="text-2xl font-semibold">Page not found</h2>
      <p class="mt-3 text-slate-300">The route you requested could not be resolved.</p>
      <a
        routerLink="/dashboard"
        class="mt-6 inline-flex rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950"
        >Return home</a
      >
    </section>
  `,
})
export class NotFoundComponent {}
