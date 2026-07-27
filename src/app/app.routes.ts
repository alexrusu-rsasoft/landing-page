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
    path: '**',
    loadComponent: () => import('./shared/ui/not-found.component').then((c) => c.NotFoundComponent),
  },
];
