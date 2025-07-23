import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ParcelService } from '../../../shared/services/parcel.service';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-user-navbar></app-user-navbar>
    <div class="courier-dashboard-container">
      <h1>Courier Dashboard</h1>
      <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div *ngIf="loading">Loading assigned parcels...</div>
      <div *ngIf="!loading && parcels.length === 0">No assigned parcels.</div>
      <div *ngIf="!loading && parcels.length > 0">
        <table class="parcel-table">
          <thead>
            <tr>
              <th>Tracking #</th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let parcel of parcels">
              <td>{{ parcel.trackingNumber }}</td>
              <td>{{ parcel.sender }}</td>
              <td>{{ parcel.recipient }}</td>
              <td>{{ parcel.origin }}</td>
              <td>{{ parcel.destination }}</td>
              <td>{{ parcel.status }}</td>
              <td>
                <div class="update-controls">
                  <select [(ngModel)]="parcel.newStatus" class="update-select">
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                  <input type="text" [(ngModel)]="parcel.newLocation" placeholder="Current Location" class="update-input" />
                  <input type="text" [(ngModel)]="parcel.newLat" placeholder="Latitude" class="update-input" />
                  <input type="text" [(ngModel)]="parcel.newLng" placeholder="Longitude" class="update-input" />
                  <div class="update-btns">
                    <button type="button" class="btn-small btn-geo" (click)="fillCurrentLocation(parcel)">
                      <span class="material-icons">my_location</span>
                    </button>
                    <button class="btn-small btn-update" (click)="updateParcel(parcel)">
                      <span class="material-icons">check_circle</span>
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .courier-dashboard-container { max-width: 1000px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.09); }
    h1 { color: #4f46e5; margin-bottom: 2rem; font-size: 2.2rem; font-weight: 700; letter-spacing: 1px; }
    .parcel-table { width: 100%; border-collapse: collapse; font-size: 1rem; }
    .parcel-table th, .parcel-table td { padding: 0.7rem 0.6rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
    .parcel-table th { background: #f3f4f6; color: #22223b; font-size: 1.05rem; font-weight: 600; }
    .parcel-table tr:last-child td { border-bottom: none; }
    .update-controls { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; }
    .update-select { min-width: 110px; font-size: 0.95rem; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid #d1d5db; background: #f9fafb; }
    .update-input { width: 110px; font-size: 0.95rem; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid #d1d5db; background: #f9fafb; }
    .update-btns { display: flex; gap: 0.2rem; }
    .btn-small { display: flex; align-items: center; justify-content: center; padding: 0.2rem 0.5rem; border-radius: 5px; font-size: 1.1rem; border: none; cursor: pointer; transition: background 0.18s; }
    .btn-geo { background: #e0e7ff; color: #3730a3; }
    .btn-geo:hover { background: #c7d2fe; }
    .btn-update { background: #4f46e5; color: #fff; }
    .btn-update:hover { background: #3730a3; }
    .material-icons { font-size: 1.2rem; vertical-align: middle; }
    .success-message { background: #d1fae5; color: #065f46; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; text-align: center; }
    .error-message { background: #fee2e2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; text-align: center; }
    @media (max-width: 700px) {
      .courier-dashboard-container { padding: 0.5rem; }
      .parcel-table th, .parcel-table td { padding: 0.4rem 0.2rem; font-size: 0.95rem; }
      .update-input, .update-select { width: 90px; font-size: 0.9rem; }
    }
  `]
})
export class CourierDashboardComponent implements OnInit {
  parcels: any[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private parcelService: ParcelService) {}

  ngOnInit() {
    this.fetchAssignedParcels();
  }

  fetchAssignedParcels() {
    this.loading = true;
    this.parcelService.getAssignedParcels().subscribe({
      next: (res: any) => {
        // If res.data exists and is an array, use it; otherwise, use res directly
        const parcels = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.parcels = parcels.map((p: any) => ({ ...p, newStatus: p.status, newLocation: '', newLat: '', newLng: '' }));
        this.loading = false;
      },
      error: (err) => {
        this.parcels = [];
        this.loading = false;
        alert('Failed to fetch assigned parcels: ' + (err.error?.message || err.statusText));
      }
    });
  }

  updateParcel(parcel: any) {
    this.successMessage = '';
    this.errorMessage = '';
    this.parcelService.updateStatus(parcel.id, parcel.newStatus).subscribe({
      next: () => {
        // Always call addTrackingStep for debugging
        console.log('Calling addTrackingStep with:', {
          status: parcel.newStatus,
          location: parcel.newLocation,
          lat: Number(parcel.newLat),
          lng: Number(parcel.newLng)
        });
        this.parcelService.addTrackingStep(parcel.id, {
          status: parcel.newStatus,
          location: parcel.newLocation,
          lat: Number(parcel.newLat),
          lng: Number(parcel.newLng)
        }).subscribe({
          next: () => {
            this.successMessage = 'Parcel status and location updated successfully!';
            setTimeout(() => { this.successMessage = ''; }, 3000);
            this.fetchAssignedParcels();
          },
          error: (err) => {
            this.errorMessage = 'Failed to update location. Please try again.';
            setTimeout(() => { this.errorMessage = ''; }, 3000);
            console.error('addTrackingStep error:', err);
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to update status. Please try again.';
        setTimeout(() => { this.errorMessage = ''; }, 3000);
      }
    });
  }

  fillCurrentLocation(parcel: any) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          parcel.newLat = position.coords.latitude;
          parcel.newLng = position.coords.longitude;
        },
        (error) => {
          alert('Failed to get location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
} 