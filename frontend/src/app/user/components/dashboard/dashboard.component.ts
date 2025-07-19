import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalComponent } from '../../../shared/components/modal.component';
import { NavbarComponent } from './navbar.component';
import { FormsModule } from '@angular/forms';

interface RecentParcel {
  id: string;
  recipient: string;
  destination: string;
  status: string;
  createdAt: Date;
  trackingNumber: string;
  weight: number;
  price: number;
  estimatedDelivery: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, NavbarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: var(--gray-50);
    }

    .dashboard-header {
      background: white;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--gray-200);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info h1 {
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .header-info p {
      color: var(--gray-600);
      margin: 0;
    }

    .header-actions .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .dashboard-section {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .section-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--gray-50);
    }

    .section-header h2 {
      color: var(--gray-900);
      margin: 0;
    }

    .view-all {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .parcels-list {
      padding: 1.5rem;
    }

    .parcel-item {
      padding: 1rem 0;
      border-bottom: 1px solid var(--gray-200);
    }

    .parcel-item:last-child {
      border-bottom: none;
    }

    .parcel-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .parcel-details h4 {
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .parcel-details p {
      color: var(--gray-600);
      margin-bottom: 0.25rem;
    }

    .tracking-number {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-family: monospace;
    }

    .parcel-status {
      text-align: right;
    }

    .date {
      display: block;
      font-size: 0.75rem;
      color: var(--gray-500);
      margin-top: 0.25rem;
    }

    .quick-actions {
      padding: 1.5rem;
      display: grid;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      color: var(--gray-700);
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .action-btn:hover {
      background: var(--gray-100);
      transform: translateX(4px);
    }

    .parcel-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--gray-200);
    }

    .action-btn-small {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      background: var(--gray-100);
      border: 1px solid var(--gray-300);
      border-radius: 0.375rem;
      color: var(--gray-700);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn-small:hover {
      background: var(--gray-200);
      transform: translateY(-1px);
    }

    .action-btn-small .material-icons {
      font-size: 1rem;
    }

    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .parcel-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .parcel-status {
        text-align: left;
      }
    }

    @media (max-width: 480px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  recentParcels: RecentParcel[] = [
    {
      id: '1',
      recipient: 'Sarah Johnson',
      destination: 'New York, NY',
      status: 'In Transit',
      createdAt: new Date('2025-01-15T03:00:00'),
      trackingNumber: 'ST123456789',
      weight: 2.5,
      price: 45.99,
      estimatedDelivery: new Date('2025-01-18T03:00:00')
    },
    {
      id: '2',
      recipient: 'Mike Chen',
      destination: 'Los Angeles, CA',
      status: 'Delivered',
      createdAt: new Date('2025-01-14T10:00:00'),
      trackingNumber: 'ST123456790',
      weight: 1.2,
      price: 30.50,
      estimatedDelivery: new Date('2025-01-16T10:00:00')
    },
    {
      id: '3',
      recipient: 'Emily Davis',
      destination: 'Chicago, IL',
      status: 'Pending',
      createdAt: new Date('2025-01-13T09:00:00'),
      trackingNumber: 'ST123456791',
      weight: 3.0,
      price: 55.00,
      estimatedDelivery: new Date('2025-01-17T09:00:00')
    },
    {
      id: '4',
      recipient: 'David Wilson',
      destination: 'Miami, FL',
      status: 'In Transit',
      createdAt: new Date('2025-01-12T08:00:00'),
      trackingNumber: 'ST123456792',
      weight: 2.0,
      price: 40.00,
      estimatedDelivery: new Date('2025-01-15T08:00:00')
    }
  ];

  modalOpen = false;
  selectedParcel: RecentParcel | null = null;

  // Modal state for history and support
  historyModalOpen = false;
  supportModalOpen = false;

  // Dummy user history data
  userHistory = [
    { date: '2025-01-10', action: 'Created parcel', details: 'Parcel to Abuja' },
    { date: '2025-01-12', action: 'Updated address', details: 'Changed to new address' },
    { date: '2025-01-14', action: 'Parcel delivered', details: 'Parcel to Lagos delivered' },
  ];

  // Support form state
  supportForm = {
    name: '',
    email: '',
    message: ''
  };
  supportFormSubmitted = false;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  trackParcel(trackingNumber: string): void {
    // Navigate to track page with pre-filled tracking number
    window.location.href = `/user/track?tracking=${trackingNumber}`;
  }

  viewMap(parcelId: string): void {
    // Open map view for specific parcel
    alert(`Opening map view for parcel ${parcelId}`);
  }

  downloadReceipt(parcelId: string): void {
    // Generate and download receipt
    alert(`Downloading receipt for parcel ${parcelId}`);
  }

  goToParcelDetails(trackingNumber: string): void {
    this.router.navigate(['/user/track'], { queryParams: { tracking: trackingNumber } });
  }

  openParcelModal(parcel: RecentParcel): void {
    this.selectedParcel = parcel;
    this.modalOpen = true;
  }
  closeModal(): void {
    this.modalOpen = false;
    this.selectedParcel = null;
  }

  openHistoryModal(): void {
    this.historyModalOpen = true;
  }
  closeHistoryModal(): void {
    this.historyModalOpen = false;
  }

  openSupportModal(): void {
    this.supportModalOpen = true;
  }
  closeSupportModal(): void {
    this.supportModalOpen = false;
    this.supportFormSubmitted = false;
    this.supportForm = { name: '', email: '', message: '' };
  }

  submitSupportForm(): void {
    this.supportFormSubmitted = true;
    // Here you would send the form data to your backend
    setTimeout(() => {
      this.closeSupportModal();
    }, 1500);
  }
}