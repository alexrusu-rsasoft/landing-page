import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

const SITE_NAME = 'RSA SOFT';

/**
 * Resolves each route's `data.titleKey` through Transloco so the document
 * title stays translated on both navigation and language change (WCAG 2.4.2).
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  readonly #title = inject(Title);
  readonly #transloco = inject(TranslocoService);
  #lastKey: string | null = null;

  constructor() {
    super();
    this.#transloco.langChanges$.subscribe(() => {
      if (this.#lastKey) this.applyTitle(this.#lastKey);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.#lastKey = this.extractTitleKey(snapshot.root);
    this.applyTitle(this.#lastKey);
  }

  private applyTitle(key: string | null): void {
    const page = key ? this.#transloco.translate(key) : null;
    this.#title.setTitle(page ? `${page} | ${SITE_NAME}` : SITE_NAME);
  }

  private extractTitleKey(snapshot: ActivatedRouteSnapshot): string | null {
    let route: ActivatedRouteSnapshot | null = snapshot;
    let key: string | null = null;
    while (route) {
      const routeKey = route.data['titleKey'] as string | undefined;
      if (routeKey) key = routeKey;
      route = route.firstChild;
    }
    return key;
  }
}
