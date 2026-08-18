import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  Router,
  TitleStrategy,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/auth.interceptor';
import { HttpHandler, HttpInterceptorFn } from '@angular/common/http';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { LocaleService } from './core/i18n/locale.service';
import { CookieConsentService } from './core/cookie-consent/cookie-consent.service';
import { OffersService } from './core/offers/offers.service';
import { AppTitleStrategy } from './core/i18n/app-title-strategy';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const interceptor = inject(AuthInterceptor);
  return interceptor.intercept(req, { handle: next } as HttpHandler);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      // withEnabledBlockingInitialNavigation() used to cover the gap between
      // shell paint and routed content landing (see below), but Angular
      // rejects combining it with hydration (NG05001) — the two solve the
      // same problem and are mutually exclusive. Hydration supersedes it:
      // prerendered routes already have full content in the initial HTML, so
      // there's no gap left to cover.
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          // Skip the transition on the initial page load — animating in the
          // very first render (against an empty document) caused a large,
          // spurious layout shift while the transition's DOM snapshot settled.
          const router = inject(Router);
          if (router.getCurrentNavigation()?.id === 1) {
            transition.skipTransition();
          }
          // The browser aborts a transition outright if the DOM changes again
          // before it settles (e.g. a fast second navigation, or hydration
          // patching the DOM). That's an expected race, not a bug — avoid an
          // unhandled-rejection console error for it.
          transition.finished.catch(() => {});
        },
      }),
    ),
    provideTransloco({
      config: {
        availableLangs: ['en', 'de', 'ro'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LocaleService).initLocale()),
    provideAppInitializer(() => inject(CookieConsentService).init()),
    // Non-blocking: just injecting the service starts its resource() fetch
    // immediately, so this kicks it off at startup without delaying first
    // render — consumers show a skeleton via OffersService.isLoading() instead.
    provideAppInitializer(() => void inject(OffersService)),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    // withEventReplay: on a prerendered page the HTML is visible before the
    // JS has hydrated, so a tap on "Accept"/"Reject" in that window would
    // otherwise be silently dropped — this queues it and replays it once
    // hydration finishes, instead of the button appearing to ignore the tap.
    provideClientHydration(withEventReplay()),
  ],
};
