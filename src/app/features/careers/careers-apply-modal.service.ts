import { Injectable, signal } from '@angular/core';
import type { AnalyticsSection } from '../../core/analytics.service';

/**
 * Shared open/close state for the "send your profile" modal, so triggers
 * outside the careers pages (e.g. the navbar CTA) can open the same modal
 * instance the page itself renders.
 */
@Injectable({ providedIn: 'root' })
export class CareersApplyModal {
  readonly isOpen = signal(false);
  readonly targetRole = signal('');
  /** Section whose button opened the form, reported with its submit (`opened_from`). */
  readonly openedFrom = signal<AnalyticsSection>('navbar');

  open(targetRole: string, openedFrom: AnalyticsSection): void {
    this.targetRole.set(targetRole);
    this.openedFrom.set(openedFrom);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
