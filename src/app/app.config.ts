import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  Router,
  TitleStrategy,
  withEnabledBlockingInitialNavigation,
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
import { AppTitleStrategy } from './core/i18n/app-title-strategy';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const interceptor = inject(AuthInterceptor);
  return interceptor.intercept(req, { handle: next } as HttpHandler);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      // Without this, Angular renders the app shell (header/footer) and only
      // inserts the routed page content once initial navigation resolves —
      // even for a synchronous, eagerly-loaded route this crosses a task
      // boundary, so the shell paints first with an empty <main>. The footer
      // then visibly jumps into its final position once the route component
      // lands, which was the largest remaining source of layout shift.
      withEnabledBlockingInitialNavigation(),
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
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
