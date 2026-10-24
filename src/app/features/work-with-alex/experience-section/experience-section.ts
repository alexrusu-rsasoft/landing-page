import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AnalyticsService } from '../../../core/analytics.service';
import { TrackSectionViewDirective } from '../../../shared/analytics/track-section-view.directive';
import { FreeCallCta } from '../../../shared/ui/free-call-cta/free-call-cta';
import { RevealOnScrollDirective } from '../../../shared/ui/reveal/reveal-on-scroll.directive';
import { ExperienceService } from '../experience';
import { ExperienceItem } from '../experience-item';

/** Legal forms say nothing about a company, so they're left out of its monogram. */
const LEGAL_SUFFIXES = new Set(['AG', 'GMBH', 'SRL', 'SA', 'LTD', 'INC', 'LLC']);

// Not in the ES2022 lib typings yet, but shipped in every browser the site supports.
type DurationFormatConstructor = new (
  locale: string,
  options: { style: 'short' },
) => { format(duration: { years?: number; months?: number }): string };

interface ExperienceEntry {
  readonly item: ExperienceItem;
  readonly monogram: string;
  readonly startYear: number;
  readonly endYear: number | null;
  /** Start and end month in the active language, e.g. "iul. 2017"; no end means the role is ongoing. */
  readonly start: string;
  readonly end: string | null;
  /** e.g. "2 ani, 1 lună"; empty where the browser can't format durations. */
  readonly duration: string;
}

/** "MHP – A Porsche Company" → "MHP", "Porsche Engineering" → "PE", "TEKsystems" → "T". */
function monogram(company: string): string {
  const words = company
    .split(/\s+/)
    .filter((word) => /^[\p{L}\d]/u.test(word) && !LEGAL_SUFFIXES.has(word.toUpperCase()));
  const first = words[0] ?? '';
  if (/^[A-Z]{2,4}$/.test(first)) return first;
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** Counts both the first and the last month, the way LinkedIn and most CVs do. */
function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1;
}

function formatDuration(months: number, lang: string): string {
  const DurationFormat = (Intl as unknown as { DurationFormat?: DurationFormatConstructor })
    .DurationFormat;
  if (!DurationFormat || !(months > 0)) return '';
  const duration: { years?: number; months?: number } = {};
  if (months >= 12) duration.years = Math.floor(months / 12);
  if (months % 12) duration.months = months % 12;
  return new DurationFormat(lang, { style: 'short' }).format(duration);
}

/**
 * The career timeline on /work-with-alex. From md up the rail fills in, nodes and
 * monograms light up and (lg+) the current role's sticky year darkens as the visitor
 * scrolls, all with CSS scroll-driven animations (see the stylesheet); it ends in an
 * open "next chapter" slot with a call invitation. Reports to GA4 how far into the
 * timeline visitors read, the end slot's view and its CTA.
 */
@Component({
  selector: 'app-experience',
  templateUrl: './experience-section.html',
  styleUrls: ['./experience-section.css'],
  imports: [TranslocoPipe, FreeCallCta, RevealOnScrollDirective, TrackSectionViewDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceSection {
  readonly #service = inject(ExperienceService);
  readonly #analytics = inject(AnalyticsService);
  readonly #transloco = inject(TranslocoService);
  readonly #lang = toSignal(this.#transloco.langChanges$, {
    initialValue: this.#transloco.getActiveLang(),
  });
  private readonly entryRefs = viewChildren<ElementRef<HTMLElement>>('entry');

  readonly isLoading = this.#service.isLoading;

  protected readonly entries = computed<ExperienceEntry[]>(() => {
    const lang = this.#lang();
    const monthYear = new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' });
    return this.#service.experiences().map((item) => {
      const start = new Date(item.start);
      const end = item.end ? new Date(item.end) : null;
      return {
        item,
        monogram: monogram(item.company),
        startYear: start.getFullYear(),
        endYear: end && end.getFullYear(),
        start: monthYear.format(start),
        end: end && monthYear.format(end),
        duration: formatDuration(monthsBetween(start, end ?? new Date()), lang),
      };
    });
  });

  constructor() {
    // Each role reports once, the first time its top passes 60% of the viewport (the same
    // line section_view uses), which shows where in the long timeline visitors stop reading.
    const reported = new Set<string>();
    let observer: IntersectionObserver | undefined;
    afterRenderEffect(() => {
      observer ??= new IntersectionObserver(
        (records) => {
          for (const record of records) {
            if (!record.isIntersecting) continue;
            const { index, company } = (record.target as HTMLElement).dataset;
            observer?.unobserve(record.target);
            if (!index || !company || reported.has(index)) continue;
            reported.add(index);
            this.#analytics.trackExperienceEntryView(Number(index), company);
          }
        },
        { threshold: 0, rootMargin: '0px 0px -40% 0px' },
      );
      for (const ref of this.entryRefs()) {
        if (!reported.has(ref.nativeElement.dataset['index'] ?? ''))
          observer.observe(ref.nativeElement);
      }
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
