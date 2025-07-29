import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParcelService } from '../../../shared/services/parcel.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';


interface Parcel {
  id: string;
  recipient: string;
  destination: string;
  status: string;
  weight: number;
  price: number;
  trackingNumber: string;
  createdAt: Date;
  estimatedDelivery: Date;
}

@Component({
  selector: 'app-parcels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="parcels-container">
      <div class="parcels-header">
        <div class="header-content" style="display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;">
          <div>
            <h1>My Parcels</h1>
            <p>Track and manage all your parcels</p>
          </div>
          <button (click)="goToDashboard()" class="btn btn-primary" style="min-width: 180px; display: flex; align-items: center; gap: 0.5rem;">
            <span class="material-icons" style="vertical-align:middle;">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div class="parcels-content">
        <div class="parcels-filters">
          <div class="search-bar">
            <span class="material-icons">search</span>
            <input
              type="text"
              placeholder="Search by recipient, destination, or tracking number"
              [(ngModel)]="searchTerm"
              (input)="filterParcels()"
            />
          </div>
          
          <div class="filter-buttons">
            <button 
              class="filter-btn" 
              [class.active]="activeFilter === 'all'"
              (click)="setFilter('all')"
            >
              All ({{ parcels.length }})
            </button>
            <button 
              class="filter-btn" 
              [class.active]="activeFilter === 'pending'"
              (click)="setFilter('pending')"
            >
              Pending ({{ getPendingCount() }})
            </button>
            <button 
              class="filter-btn" 
              [class.active]="activeFilter === 'in-transit'"
              (click)="setFilter('in-transit')"
            >
              In Transit ({{ getInTransitCount() }})
            </button>
            <button 
              class="filter-btn" 
              [class.active]="activeFilter === 'delivered'"
              (click)="setFilter('delivered')"
            >
              Delivered ({{ getDeliveredCount() }})
            </button>
          </div>
        </div>

        <div class="parcels-grid">
          <div class="parcel-card" *ngFor="let parcel of filteredParcels">
            <div class="parcel-header">
              <div class="parcel-id">
                <span class="material-icons">local_shipping</span>
                <span>{{ parcel.trackingNumber }}</span>
              </div>
              <span class="status-badge" [ngClass]="'status-' + parcel.status.toLowerCase().replace(' ', '-')">
                {{ parcel.status }}
              </span>
            </div>
            
            <div class="parcel-details">
              <div class="detail-row">
                <span class="label">Recipient:</span>
                <span class="value">{{ parcel.recipient }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Destination:</span>
                <span class="value">{{ parcel.destination }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span class="value price">\${{ parcel.price }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Created:</span>
                <span class="value">{{ parcel.createdAt | date:'short' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Est. Delivery:</span>
                <span class="value">{{ parcel.estimatedDelivery | date:'short' }}</span>
              </div>
            </div>
            
            <div class="parcel-actions">
              <button class="btn btn-outline" (click)="trackParcel(parcel.trackingNumber)">
                <span class="material-icons">visibility</span>
                Track
              </button>
              <button class="btn btn-outline" (click)="viewMap(parcel.id)">
                <span class="material-icons">map</span>
                View Map
              </button>
              <button class="btn btn-outline" (click)="downloadReceipt(parcel.id)">
                <span class="material-icons">download</span>
                Receipt
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredParcels.length === 0">
          <div class="empty-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <h3>No parcels found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .parcels-container {
      min-height: 100vh;
      background: var(--gray-50);
    }

    .parcels-header {
      background: white;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--gray-200);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header-content h1 {
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .header-content p {
      color: var(--gray-600);
      margin: 0;
    }

    .parcels-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .parcels-filters {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      margin-bottom: 2rem;
    }

    .search-bar {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .search-bar .material-icons {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
    }

    .search-bar input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 2px solid var(--gray-300);
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .search-bar input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 2px solid var(--gray-300);
      background: white;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-600);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-btn:hover {
      border-color: var(--primary-500);
      color: var(--primary-600);
    }

    .filter-btn.active {
      background: var(--primary-600);
      border-color: var(--primary-600);
      color: white;
    }

    .parcels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .parcel-card {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .parcel-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .parcel-header {
      padding: 1.5rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .parcel-id {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: monospace;
      font-weight: 500;
      color: var(--gray-700);
    }

    .parcel-details {
      padding: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: var(--gray-600);
    }

    .value {
      color: var(--gray-900);
    }

    .value.price {
      font-weight: 600;
      color: var(--primary-600);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .type-sent {
      background-color: var(--primary-100);
      color: var(--primary-800);
    }

    .type-received {
      background-color: var(--secondary-100);
      color: var(--secondary-800);
    }

    .parcel-actions {
      padding: 1.5rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
      display: flex;
      gap: 0.75rem;
    }

    .parcel-actions .btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .parcels-container {
        padding: 1rem;
      }

      .parcels-header .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
        text-align: center;
      }

      .parcels-header .btn {
        width: 100%;
        justify-content: center;
      }

      .parcels-filters {
        flex-direction: column;
        gap: 1rem;
      }

      .search-bar {
        width: 100%;
      }

      .filter-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }

      .filter-btn {
        width: 100%;
        padding: 0.75rem;
      }

      .parcels-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .parcel-card {
        margin-bottom: 1rem;
      }

      .parcel-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .parcel-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .parcel-actions .btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .parcels-container {
        padding: 0.5rem;
      }

      .parcels-header h1 {
        font-size: 1.5rem;
      }

      .parcels-header p {
        font-size: 0.9rem;
      }

      .parcel-details {
        padding: 1rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .parcel-actions {
        padding: 1rem;
      }

      .parcel-actions .btn {
        padding: 0.75rem;
        font-size: 0.8rem;
      }
    }
  `]
})
export class ParcelsComponent implements OnInit {
  searchTerm = '';
  activeFilter = 'all';
  parcels: Parcel[] = [];
  filteredParcels: Parcel[] = [];

  constructor(private parcelService: ParcelService, private router: Router) {}

  ngOnInit(): void {
    // Fetch both sent and received parcels and merge them
    this.parcelService.getSentParcels().subscribe((sent: { data?: Parcel[] } | Parcel[]) => {
      const sentParcels = (sent as any).data || sent;
      const mappedSent = (sentParcels as Parcel[]).map((p) => ({
        id: p.id,
        recipient: p.recipient,
        destination: p.destination,
        status: p.status,
        weight: p.weight || 0,
        price: p.price,
        trackingNumber: p.trackingNumber,
        createdAt: new Date(p.createdAt),
        estimatedDelivery: new Date(p.createdAt),
      }));
      this.parcelService.getReceivedParcels().subscribe((received: { data?: Parcel[] } | Parcel[]) => {
        const receivedParcels = (received as any).data || received;
        const mappedReceived = (receivedParcels as Parcel[]).map((p) => ({
          id: p.id,
          recipient: p.recipient,
          destination: p.destination,
          status: p.status,
          weight: p.weight || 0,
          price: p.price,
          trackingNumber: p.trackingNumber,
          createdAt: new Date(p.createdAt),
          estimatedDelivery: new Date(p.createdAt),
        }));
        this.parcels = [...mappedSent, ...mappedReceived];
        this.filterParcels();
      });
    });
  }

  filterParcels(): void {
    let filtered = this.parcels;

    // Apply status filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(parcel => 
        parcel.status.toLowerCase().replace(' ', '-') === this.activeFilter
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(parcel =>
        parcel.recipient.toLowerCase().includes(search) ||
        parcel.destination.toLowerCase().includes(search) ||
        parcel.trackingNumber.toLowerCase().includes(search)
      );
    }

    this.filteredParcels = filtered;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterParcels();
  }

  getPendingCount(): number {
    return this.parcels.filter(p => p.status.toUpperCase() === 'PENDING').length;
  }

  getInTransitCount(): number {
    return this.parcels.filter(p => p.status.toUpperCase() === 'IN_TRANSIT').length;
  }

  getDeliveredCount(): number {
    return this.parcels.filter(p => p.status.toUpperCase() === 'DELIVERED').length;
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  trackParcel(trackingNumber: string): void {
    // Navigate to track page with pre-filled tracking number
    this.router.navigate(['/user/track'], { queryParams: { tracking: trackingNumber } });
  }

  viewMap(parcelId: string): void {
    // Navigate to the track page with the parcel ID for map view
    this.router.navigate(['/user/track'], { queryParams: { parcel: parcelId, map: true } });
  }

  downloadReceipt(parcelId: string): void {
    fetch(`${environment.apiUrl}/parcels/${parcelId}/receipt`, {
      method: 'GET',
      credentials: 'include', // include cookies if needed for auth
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${parcelId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });
  }
}