import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isActive, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { AnalyticsService, CtaLabel } from '../analytics.service';
import { CookieConsentService } from '../cookie-consent/cookie-consent.service';

const NAV_SECTION_IDS = ['protocol', 'proof', 'pricing'];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, TranslocoPipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  readonly #analytics = inject(AnalyticsService);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly #hostElement = inject(ElementRef<HTMLElement>);
  protected readonly cookieConsent = inject(CookieConsentService);

  isContactPage = isActive('/contact', this.#router, {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  isCareersPage = isActive('/careers', this.#router, {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });

  readonly currentYear = new Date().getFullYear();
  protected readonly mobileMenuOpen = signal(false);
  protected readonly activeSection = signal<string | null>(null);

  private readonly mobileMenuToggle = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuToggle');
  private readonly mobileMenu = viewChild<ElementRef<HTMLElement>>('mobileMenu');

  #sectionObserver?: IntersectionObserver;
  readonly #visibleSections = new Set<string>();

  constructor() {
    this.#router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => requestAnimationFrame(() => this.setupScrollSpy()));

    this.#destroyRef.onDestroy(() => this.#sectionObserver?.disconnect());
  }

  protected trackCta(label: CtaLabel): void {
    this.#analytics.trackCtaClick(label);
  }

  protected toggleMobileMenu(): void {
    const opening = !this.mobileMenuOpen();
    this.mobileMenuOpen.set(opening);
    if (opening) {
      requestAnimationFrame(() =>
        this.mobileMenu()?.nativeElement.querySelector<HTMLElement>('a, button')?.focus(),
      );
    }
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  private closeMobileMenuAndReturnFocus(): void {
    this.closeMobileMenu();
    this.mobileMenuToggle()?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.mobileMenuOpen()) this.closeMobileMenuAndReturnFocus();
  }

  /**
   * Highlights the nav link for whichever tracked section is currently
   * scrolled into view. Sections live inside lazily-loaded route content,
   * so the observer is torn down and rebuilt on every navigation.
   */
  private setupScrollSpy(): void {
    this.#sectionObserver?.disconnect();
    this.#visibleSections.clear();
    this.activeSection.set(null);

    const sections = NAV_SECTION_IDS.map(
      (id) => this.#hostElement.nativeElement.querySelector(`main #${id}`) as HTMLElement | null,
    ).filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    this.#sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            this.#visibleSections.add(id);
          } else {
            this.#visibleSections.delete(id);
          }
        }

        const topMost = NAV_SECTION_IDS.find((id) => this.#visibleSections.has(id));
        this.activeSection.set(topMost ?? null);
      },
      { root: null, rootMargin: '-100px 0px -70% 0px', threshold: 0 },
    );

    for (const section of sections) {
      this.#sectionObserver.observe(section);
    }
  }
}
