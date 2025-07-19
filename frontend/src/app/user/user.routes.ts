import { Routes } from '@angular/router';

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
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];