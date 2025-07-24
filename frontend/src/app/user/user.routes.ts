import { Routes } from '@angular/router';
import { CourierDashboardComponent } from './components/dashboard/courier-dashboard.component';
import { AuthGuard } from '../shared/services/auth.guard';

export const userRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'parcels',
    loadComponent: () => import('./components/parcels/parcels.component').then(m => m.ParcelsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'track',
    loadComponent: () => import('./components/track/track.component').then(m => m.TrackComponent),
    canActivate: [AuthGuard]
  },
  { path: 'courier/dashboard', component: CourierDashboardComponent, canActivate: [AuthGuard] },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];