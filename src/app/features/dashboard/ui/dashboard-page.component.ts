import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CountUpDirective } from '../../../shared/ui/count-up/count-up.directive';
import { CountUpStat } from '../../../shared/ui/count-up/count-up-stat';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { DeveloperProfilesSection } from '../../developer-profiles/developer-profiles-section/developer-profiles-section';
import { Certifications } from '../../work-with-alex/certifications/certifications';
import { LeadMagnetSection } from '../lead-magnet/lead-magnet-section';
import { CostCalculator } from '../pricing/cost-calculator';

const PROTOCOL_PHASE_COUNT = 4;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    Certifications,
    CostCalculator,
    DeveloperProfilesSection,
    FreeCallCta,
    LeadMagnetSection,
    TranslocoPipe,
    CountUpDirective,
    CountUpStat,
    RevealOnScrollDirective,
  ],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly mobileMenuOpen = signal(false);

  protected readonly activeProtocolPhase = signal(0);
  protected readonly protocolProgressPercent = computed(
    () => ((this.activeProtocolPhase() + 1) / PROTOCOL_PHASE_COUNT) * 100,
  );

  private readonly analytics = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly protocolSection = viewChild<ElementRef<HTMLElement>>('protocolSection');

  constructor() {
    afterNextRender(() => this.setupProtocolScrollProgress());
  }

  protected trackCta(label: CtaLabel): void {
    this.analytics.trackCtaClick(label);
  }

  protected trackContact(label: string): void {
    this.analytics.trackContactClick(label as never);
  }

  private setupProtocolScrollProgress(): void {
    const section = this.protocolSection()?.nativeElement;
    if (!section) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const total = rect.height + viewportHeight;
      const progressed = viewportHeight - rect.top;
      const progress = Math.min(1, Math.max(0, progressed / total));
      const phase = Math.min(PROTOCOL_PHASE_COUNT - 1, Math.floor(progress * PROTOCOL_PHASE_COUNT));
      this.activeProtocolPhase.set(phase);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    update();

    if (reducedMotion) {
      this.activeProtocolPhase.set(PROTOCOL_PHASE_COUNT - 1);
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });
  }
}
