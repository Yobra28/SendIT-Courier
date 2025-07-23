import { Routes } from '@angular/router';
import { CourierDashboardComponent } from './components/dashboard/courier-dashboard.component';

export const userRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'parcels',
    loadComponent: () => import('./components/parcels/parcels.component').then(m => m.ParcelsComponent)
  },
  {
    path: 'track',
    loadComponent: () => import('./components/track/track.component').then(m => m.TrackComponent)
  },
  { path: 'courier/dashboard', component: CourierDashboardComponent },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];