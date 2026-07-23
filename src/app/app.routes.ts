import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
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
    path: '**',
    loadComponent: () => import('./shared/ui/not-found.component').then((m) => m.NotFoundComponent),
  },
];
