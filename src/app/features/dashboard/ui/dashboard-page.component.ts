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
import { TranslocoPipe } from '@jsverse/transloco';
import { AnalyticsService, CtaLabel } from '../../../core/analytics.service';
import { CountUpDirective } from '../../../shared/ui/count-up/count-up.directive';
import { CountUpStat } from '../../../shared/ui/count-up/count-up-stat';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { DeveloperProfilesSection } from '../../developer-profiles/developer-profiles-section/developer-profiles-section';
import { Certifications } from '../../work-with-alex/certifications/certifications';
import { HeroCarousel } from '../hero/hero-carousel';
import { LeadMagnetSection } from '../lead-magnet/lead-magnet-section';
import { CostCalculator } from '../pricing/cost-calculator';

const PROTOCOL_PHASE_COUNT = 4;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    Certifications,
    CostCalculator,
    DeveloperProfilesSection,
    FreeCallCta,
    HeroCarousel,
    LeadMagnetSection,
    TranslocoPipe,
    CountUpDirective,
    CountUpStat,
    RevealOnScrollDirective,
  ],
  templateUrl: './dashboard-page.component.html',
  // The protocol section reads differently per breakpoint:
  //
  // - Desktop pins the whole panel (title, progress bar, the four-column card
  //   row) to the top and holds it there while the phases advance.
  //   `.protocol-track` is the scroll distance that pinning is spent against:
  //   the panel sticks until its bottom reaches the track's bottom, so the
  //   track must be taller than the panel or there is nothing to stick
  //   through.
  // - Mobile has no room to pin a four-card row, so only the header sticks
  //   (that rule lives in the template as `sticky top-20 lg:static`) and the
  //   cards scroll past it in a normal column. The section keeps its natural
  //   height there — no track, no pinning.
  styles: `
    @media (min-width: 1024px) {
      .protocol-track {
        /* One panel height plus ~60svh of scroll per phase. */
        height: 340svh;
      }

      /* Fill the pinned viewport and centre the content in it, so the hold
         reads as a deliberate full-screen chapter rather than a short block
         with dead space under it. */
      .protocol-panel {
        position: sticky;
        top: 5rem;
        z-index: 10;
        min-height: calc(100svh - 5rem);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly mobileMenuOpen = signal(false);

  protected readonly activeProtocolPhase = signal(0);
  /** 0 → 1 across the protocol section; drives the progress bar's width. */
  private readonly protocolProgress = signal(0);
  protected readonly protocolProgressPercent = computed(() => this.protocolProgress() * 100);

  private readonly analytics = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly protocolSection = viewChild<ElementRef<HTMLElement>>('protocolSection');
  private readonly protocolPanel = viewChild<ElementRef<HTMLElement>>('protocolPanel');
  private readonly protocolHeader = viewChild<ElementRef<HTMLElement>>('protocolHeader');
  private readonly protocolCards = viewChild<ElementRef<HTMLElement>>('protocolCards');

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
    const panel = this.protocolPanel()?.nativeElement;
    const header = this.protocolHeader()?.nativeElement;
    const cards = this.protocolCards()?.nativeElement;
    if (!section || !panel || !header || !cards) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.matchMedia('(min-width: 1024px)');

    const update = () => {
      const progress = isDesktop.matches
        ? this.pinnedProgress(section, panel)
        : this.columnProgress(header, cards);
      if (progress === null) return;

      this.protocolProgress.set(progress);
      // The last phase lands exactly when the bar fills, so the four labels
      // and the bar always agree.
      const steps = PROTOCOL_PHASE_COUNT - 1;
      this.activeProtocolPhase.set(Math.min(steps, Math.floor(progress * steps + 1e-6)));
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
      this.protocolProgress.set(1);
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

  /**
   * Desktop: the panel is pinned for as long as it can travel inside the
   * track, and that travel is the scroll budget the phases are spent against.
   * The last stretch is held back as a tail so the final phase stays on screen
   * for a beat before the panel unpins.
   */
  private pinnedProgress(section: HTMLElement, panel: HTMLElement): number | null {
    const rect = section.getBoundingClientRect();
    const travel = rect.height - panel.offsetHeight;
    if (travel <= 0) return null;

    const stickyTop = parseFloat(getComputedStyle(panel).top) || 0;
    const scrolled = (stickyTop - rect.top) / travel;
    const HOLD_TAIL = 0.85;
    return Math.min(1, Math.max(0, scrolled / HOLD_TAIL));
  }

  /**
   * Mobile: nothing is pinned but the header, and the cards scroll past it in
   * a normal column. Progress runs from the first card meeting the header to
   * the last one meeting it, so the bar starts empty and is full exactly when
   * the reader arrives at the final card.
   */
  private columnProgress(header: HTMLElement, cards: HTMLElement): number | null {
    const first = cards.firstElementChild;
    const last = cards.lastElementChild;
    if (!first || !last || first === last) return null;

    const firstTop = first.getBoundingClientRect().top;
    const travel = last.getBoundingClientRect().top - firstTop;
    if (travel <= 0) return null;

    const scrolled = header.getBoundingClientRect().bottom - firstTop;
    return Math.min(1, Math.max(0, scrolled / travel));
  }
}
