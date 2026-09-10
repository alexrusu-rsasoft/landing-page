import { Injectable, signal } from '@angular/core';

/**
 * Shared open/close state for the "send your profile" modal, so triggers
 * outside the careers pages (e.g. the navbar CTA) can open the same modal
 * instance the page itself renders.
 */
@Injectable({ providedIn: 'root' })
export class CareersApplyModal {
  readonly isOpen = signal(false);
  readonly targetRole = signal('');

  open(targetRole = ''): void {
    this.targetRole.set(targetRole);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
