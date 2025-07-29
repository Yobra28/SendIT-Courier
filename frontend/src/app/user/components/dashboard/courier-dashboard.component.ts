import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ParcelService } from '../../../shared/services/parcel.service';
import { CourierNavbarComponent } from './courier-navbar.component';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CourierNavbarComponent],
  template: `
    <app-courier-navbar></app-courier-navbar>
    <div class="courier-dashboard-modern">
      <div class="dashboard-header-modern">
        <h1>Courier Dashboard</h1>
        <div class="dashboard-subtitle">Manage your assigned deliveries with ease.</div>
      </div>
      <div class="dashboard-content-modern">
        <div class="dashboard-card-modern">
          <div class="dashboard-card-header">
            <span class="material-icons">local_shipping</span>
            <span>Assigned Parcels</span>
          </div>

          <!-- Search Bar for Parcel by Tracking Number -->
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <input
              type="text"
              [(ngModel)]="searchTrackingNumber"
              placeholder="Search by Tracking Number"
              class="update-input-modern"
              style="max-width: 260px;"
            />
            <button class="btn-small btn-update-modern" (click)="searchParcelsByTrackingNumber()">
              <span class="material-icons">search</span> Search
            </button>
            <button *ngIf="searchTrackingNumber" class="btn-small btn-geo-modern" (click)="clearSearch()">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div *ngIf="successMessage" class="success-message-modern">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="error-message-modern">{{ errorMessage }}</div>
          <div *ngIf="loading" class="loading-modern">
            <span class="material-icons spin">autorenew</span> Loading assigned parcels...
          </div>
          <div *ngIf="!loading && filteredParcels.length === 0" class="empty-modern">
            <span class="material-icons">inbox</span>
            <div>No assigned parcels.</div>
          </div>
          <div *ngIf="!loading && filteredParcels.length > 0" class="table-responsive-modern">
            <table class="parcel-table-modern">
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
                <tr *ngFor="let parcel of filteredParcels">
                  <td class="tracking-cell">{{ parcel.trackingNumber }}</td>
                  <td>{{ parcel.sender }}</td>
                  <td>{{ parcel.recipient }}</td>
                  <td>{{ parcel.origin }}</td>
                  <td>{{ parcel.destination }}</td>
                  <td>
                    <span class="status-badge-modern status-{{ parcel.status.toLowerCase() }}">
                      {{ parcel.status.replace('_', ' ') }}
                    </span>
                  </td>
                  <td>
                    <div class="update-controls-modern">
                      <select [(ngModel)]="parcel.newStatus" class="update-select-modern">
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="OUT_FOR_PICKUP">Out for Pickup</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <input type="text" [(ngModel)]="parcel.newLocation" placeholder="Current Location" class="update-input-modern" />
                      <input type="text" [(ngModel)]="parcel.newLat" placeholder="Latitude" class="update-input-modern" />
                      <input type="text" [(ngModel)]="parcel.newLng" placeholder="Longitude" class="update-input-modern" />
                      <div class="update-btns-modern">
                        <button type="button" class="btn-small btn-geo-modern" (click)="fillCurrentLocation(parcel)">
                          <span class="material-icons">my_location</span>
                        </button>
                        <button class="btn-small btn-update-modern" (click)="updateParcel(parcel)">
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
      </div>
    </div>
  `,
  styles: [`
    .courier-dashboard-modern {
      max-width: 1200px;
      margin: 2.5rem auto;
      padding: 2rem 1.5rem;
      background: linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%);
      border-radius: 1.5rem;
      box-shadow: 0 6px 32px rgba(80, 112, 255, 0.08);
      min-height: 80vh;
    }
    .dashboard-header-modern {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .dashboard-header-modern h1 {
      color: #3730a3;
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .dashboard-subtitle {
      color: #6366f1;
      font-size: 1.15rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .dashboard-content-modern {
      display: flex;
      justify-content: center;
    }
    .dashboard-card-modern {
      background: #fff;
      border-radius: 1.2rem;
      box-shadow: 0 2px 16px rgba(80, 112, 255, 0.07);
      padding: 2rem 1.5rem;
      width: 100%;
      max-width: 1050px;
    }
    .dashboard-card-header {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-size: 1.3rem;
      font-weight: 700;
      color: #3730a3;
      margin-bottom: 1.5rem;
    }
    .dashboard-card-header .material-icons {
      font-size: 1.7rem;
      color: #6366f1;
    }
    .success-message-modern {
      background: #d1fae5;
      color: #065f46;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 600;
    }
    .error-message-modern {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 600;
    }
    .loading-modern {
      text-align: center;
      color: #6366f1;
      font-size: 1.1rem;
      margin: 2rem 0;
    }
    .loading-modern .spin {
      animation: spin 1.2s linear infinite;
      display: inline-block;
      vertical-align: middle;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .empty-modern {
      text-align: center;
      color: #a1a1aa;
      font-size: 1.1rem;
      margin: 2.5rem 0;
    }
    .empty-modern .material-icons {
      font-size: 2.5rem;
      color: #c7d2fe;
      margin-bottom: 0.5rem;
    }
    .table-responsive-modern {
      overflow-x: auto;
      margin-top: 1.5rem;
    }
    .parcel-table-modern {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      background: #f9fafb;
      border-radius: 1rem;
      box-shadow: 0 1px 4px rgba(80, 112, 255, 0.04);
      font-size: 1.05rem;
    }
    .parcel-table-modern th, .parcel-table-modern td {
      padding: 1rem 0.7rem;
      text-align: left;
    }
    .parcel-table-modern th {
      background: #f3f4f6;
      color: #3730a3;
      font-weight: 700;
      font-size: 1.08rem;
      border-bottom: 2px solid #e0e7ff;
    }
    .parcel-table-modern tr:last-child td {
      border-bottom: none;
    }
    .tracking-cell {
      font-family: monospace;
      color: #6366f1;
      font-weight: 600;
      font-size: 1.08rem;
    }
    .status-badge-modern {
      display: inline-block;
      padding: 0.35em 1em;
      border-radius: 1em;
      font-size: 0.98em;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
      text-transform: capitalize;
    }
    .status-badge-modern.status-in_transit {
      background: #fef9c3;
      color: #b45309;
    }
    .status-badge-modern.status-delivered {
      background: #d1fae5;
      color: #065f46;
    }
    .status-badge-modern.status-pending {
      background: #f3f4f6;
      color: #64748b;
    }
    .update-controls-modern {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      align-items: center;
    }
    .update-select-modern {
      min-width: 110px;
      font-size: 0.98rem;
      padding: 0.3rem 0.7rem;
      border-radius: 7px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      margin-right: 0.3rem;
    }
    .update-input-modern {
      width: 110px;
      font-size: 0.98rem;
      padding: 0.3rem 0.7rem;
      border-radius: 7px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      margin-right: 0.3rem;
    }
    .update-btns-modern {
      display: flex;
      gap: 0.2rem;
    }
    .btn-small {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.2rem 0.5rem;
      border-radius: 5px;
      font-size: 1.1rem;
      background: #6366f1;
      color: #fff;
      border: none;
      cursor: pointer;
      transition: background 0.18s;
    }
    .btn-small:hover {
      background: #3730a3;
      color: #fff;
    }
    .btn-geo-modern {
      background: #e0e7ff;
      color: #3730a3;
    }
    .btn-geo-modern:hover {
      background: #c7d2fe;
    }
    .btn-update-modern {
      background: #6366f1;
      color: #fff;
    }
    .btn-update-modern:hover {
      background: #3730a3;
    }
    .material-icons {
      font-size: 1.2rem;
      vertical-align: middle;
    }
    @media (max-width: 900px) {
      .courier-dashboard-modern {
        padding: 1rem 0.3rem;
      }
      .dashboard-header-modern h1 {
        font-size: 2rem;
      }
      .dashboard-card-modern {
        padding: 1rem 0.3rem;
      }
      .parcel-table-modern th, .parcel-table-modern td {
        padding: 0.7rem 0.3rem;
        font-size: 0.98rem;
      }
      .update-input-modern, .update-select-modern {
        width: 90px;
        font-size: 0.95rem;
      }
    }
    @media (max-width: 768px) {
      .courier-dashboard-modern {
        padding: 0.5rem;
      }
      .dashboard-header-modern h1 {
        font-size: 1.75rem;
      }
      .dashboard-card-modern {
        padding: 0.75rem;
      }
      .parcel-table-modern {
        font-size: 0.9rem;
      }
      .parcel-table-modern th, .parcel-table-modern td {
        padding: 0.5rem 0.25rem;
        font-size: 0.85rem;
      }
      .update-controls-modern {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }
      .update-input-modern, .update-select-modern {
        width: 100%;
        min-width: auto;
        margin-right: 0;
      }
      .update-btns-modern {
        justify-content: center;
        gap: 0.5rem;
      }
      .btn-small {
        padding: 0.3rem 0.6rem;
        font-size: 0.9rem;
      }
      .material-icons {
        font-size: 1rem;
      }
    }
    @media (max-width: 600px) {
      .courier-dashboard-modern {
        padding: 0.5rem 0.1rem;
      }
      .dashboard-header-modern h1 {
        font-size: 1.5rem;
      }
      .dashboard-card-modern {
        padding: 0.5rem 0.1rem;
      }
      .parcel-table-modern th, .parcel-table-modern td {
        padding: 0.4rem 0.1rem;
        font-size: 0.8rem;
      }
      .update-input-modern, .update-select-modern {
        width: 100%;
        font-size: 0.85rem;
      }
      .tracking-cell {
        font-size: 0.9rem;
      }
      .status-badge-modern {
        font-size: 0.8rem;
        padding: 0.25em 0.75em;
      }
    }
  `]
})
export class CourierDashboardComponent implements OnInit {
  parcels: any[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';
  searchTrackingNumber: string = '';
  filteredParcels: any[] = [];

  constructor(private http: HttpClient, private parcelService: ParcelService) {}

  ngOnInit() {
    this.fetchAssignedParcels();
  }

  fetchAssignedParcels() {
    this.loading = true;
    this.parcelService.getAssignedParcels().subscribe({
      next: (res: any) => {
        const parcels = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        this.parcels = parcels.map((p: any) => ({ ...p, newStatus: p.status, newLocation: '', newLat: '', newLng: '' }));
        this.applySearchFilter();
        this.loading = false;
      },
      error: (err) => {
        this.parcels = [];
        this.filteredParcels = [];
        this.loading = false;
        alert('Failed to fetch assigned parcels: ' + (err.error?.message || err.statusText));
      }
    });
  }

  searchParcelsByTrackingNumber() {
    this.applySearchFilter();
  }

  clearSearch() {
    this.searchTrackingNumber = '';
    this.applySearchFilter();
  }

  applySearchFilter() {
    if (!this.searchTrackingNumber) {
      this.filteredParcels = this.parcels;
    } else {
      const search = this.searchTrackingNumber.trim().toLowerCase();
      this.filteredParcels = this.parcels.filter(parcel =>
        parcel.trackingNumber && parcel.trackingNumber.toLowerCase().includes(search)
      );
    }
  }

  updateParcel(parcel: any) {
    const updateStatus = parcel.newStatus && parcel.newStatus !== parcel.status;
    const updateLocation = parcel.newLat && parcel.newLng;
    if (!updateStatus && !updateLocation) {
      this.errorMessage = 'Please provide at least one field to update.';
      setTimeout(() => this.errorMessage = '', 2000);
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';
    if (updateStatus && updateLocation) {
      this.parcelService.updateStatus(parcel.id, parcel.newStatus).subscribe({
        next: () => {
          this.parcelService.updateCurrentLocation(parcel.id, parseFloat(parcel.newLat), parseFloat(parcel.newLng)).subscribe({
            next: () => {
              this.successMessage = 'Status and location updated!';
              setTimeout(() => this.successMessage = '', 2000);
            },
            error: () => {
              this.errorMessage = 'Failed to update location.';
              setTimeout(() => this.errorMessage = '', 2000);
            }
          });
        },
        error: () => {
          this.errorMessage = 'Failed to update status.';
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    } else if (updateStatus) {
      this.parcelService.updateStatus(parcel.id, parcel.newStatus).subscribe({
        next: () => {
          this.successMessage = 'Status updated!';
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: () => {
          this.errorMessage = 'Failed to update status.';
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    } else if (updateLocation) {
      this.parcelService.updateCurrentLocation(parcel.id, parseFloat(parcel.newLat), parseFloat(parcel.newLng)).subscribe({
        next: () => {
          this.successMessage = 'Location updated!';
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: () => {
          this.errorMessage = 'Failed to update location.';
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
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

  openProfile() {
    // Optionally, trigger a profile modal or route. For now, just alert.
    alert('Profile modal is available in the top right menu.');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  }
} 