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
    path: 'compliance-tracker',
    loadComponent: () =>
      import('./features/compliance-tracker/ui/compliance-tracker-page.component').then(
        (m) => m.ComplianceTrackerPageComponent,
      ),
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
