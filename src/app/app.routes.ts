import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (c) => c.DashboardPageComponent,
      ),
    data: { titleKey: 'meta.home' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (c) => c.DashboardPageComponent,
      ),
    data: { titleKey: 'meta.home' },
  },
  {
    path: 'work-with-alex',
    loadComponent: () =>
      import('./features/work-with-alex/work-with-alex').then((c) => c.WorkWithAlex),
    data: { titleKey: 'meta.workWithAlex' },
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar').then((c) => c.Calendar),
    data: { titleKey: 'meta.calendar' },
  },
  {
    path: 'careers',
    loadComponent: () =>
      import('./features/careers/careers-page/careers-page').then((c) => c.CareersPage),
    data: { titleKey: 'meta.careers' },
  },
  {
    path: 'contact',
    loadComponent: () => import('./shared/ui/contact/contact').then((c) => c.Contact),
    data: { titleKey: 'meta.contact' },
  },
  {
    path: 'call-confirmed',
    loadComponent: () =>
      import('./features/call-confirmed/call-confirmed').then((c) => c.CallConfirmed),
    data: { titleKey: 'meta.callConfirmed' },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy').then((c) => c.PrivacyPolicy),
    data: { titleKey: 'legal.privacyPolicy.title' },
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./features/legal/cookie-policy/cookie-policy').then((c) => c.CookiePolicy),
    data: { titleKey: 'legal.cookiePolicy.title' },
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms').then((c) => c.Terms),
    data: { titleKey: 'legal.terms.title' },
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./features/legal/legal-notice/legal-notice').then((c) => c.LegalNotice),
    data: { titleKey: 'legal.legalNotice.title' },
  },
  {
    path: 'accessibility',
    loadComponent: () =>
      import('./features/legal/accessibility/accessibility').then((c) => c.Accessibility),
    data: { titleKey: 'legal.accessibility.title' },
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found.component').then((c) => c.NotFoundComponent),
    data: { titleKey: 'notFound.title' },
  },
];
