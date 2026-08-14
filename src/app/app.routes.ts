import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (c) => c.DashboardPageComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (c) => c.DashboardPageComponent,
      ),
  },
  {
    path: 'work-with-alex',
    loadComponent: () =>
      import('./features/work-with-alex/work-with-alex').then((c) => c.WorkWithAlex),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar').then((c) => c.Calendar),
  },
  {
    path: 'contact',
    loadComponent: () => import('./shared/ui/contact/contact').then((c) => c.Contact),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy').then((c) => c.PrivacyPolicy),
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./features/legal/cookie-policy/cookie-policy').then((c) => c.CookiePolicy),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms').then((c) => c.Terms),
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./features/legal/legal-notice/legal-notice').then((c) => c.LegalNotice),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found.component').then((c) => c.NotFoundComponent),
  },
];
