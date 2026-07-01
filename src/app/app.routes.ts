import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
    children: [
      {
        path: 'book-a-call',
        loadComponent: () =>
          import('./shared/ui/book-a-call-modal.component').then(
            (m) => m.BookACallModalComponent,
          ),
      },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
    children: [
      {
        path: 'book-a-call',
        loadComponent: () =>
          import('./shared/ui/book-a-call-modal.component').then(
            (m) => m.BookACallModalComponent,
          ),
      },
    ],
  },
  {
    path: 'compliance-tracker',
    loadComponent: () =>
      import('./features/compliance-tracker/ui/compliance-tracker-page.component').then(
        (m) => m.ComplianceTrackerPageComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found.component').then((m) => m.NotFoundComponent),
  },
];
