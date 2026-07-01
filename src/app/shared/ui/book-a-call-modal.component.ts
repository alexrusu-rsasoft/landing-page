import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-a-call-modal',
  imports: [],
  template: `
    <div
      class="animate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-md sm:px-6 lg:px-8"
    >
      <div
        class="animate-modal-content relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-primary"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
              Book a discovery call
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-950">Choose a time that works for you</h2>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:border-primary/40 hover:text-primary"
            aria-label="Close booking modal"
            (click)="close()"
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-hidden bg-white p-3 sm:p-4 lg:p-6">
          <div
            class="flex h-full min-h-[70vh] flex-col rounded-[1.5rem] border border-slate-100 bg-slate-50/30 p-2 sm:p-3"
          >
            <div
              class="mb-3 rounded-[1.25rem] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700"
            >
              This booking flow is handled directly in our Google Calendar, so you can reserve a
              time without email back-and-forth.
            </div>
            <iframe
              title="Book a call with RSA SOFT"
              src="https://calendar.app.google/u2W4KHHoq5rvVB4X7"
              class="min-h-[60vh] w-full rounded-[1.25rem] border-0"
              loading="lazy"
              allow="clipboard-write"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BookACallModalComponent {
  private readonly router = inject(Router);

  protected close(): void {
    this.router.navigate(['/']);
  }
}
