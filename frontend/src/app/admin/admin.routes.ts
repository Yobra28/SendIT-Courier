import { Routes } from '@angular/router';
import { AuthGuard } from '../shared/services/auth.guard';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];