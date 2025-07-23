import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ModalComponent } from '../../../shared/components/modal.component';
import { NavbarComponent } from './navbar.component';
import { FormsModule } from '@angular/forms';
import { ParcelService } from '../../../shared/services/parcel.service';
import { ContactService, ContactPayload } from '../../../shared/services/contact.service';
import { UserService } from '../../../shared/services/user.service';

interface RecentParcel {
  id: string;
  recipient: string;
  destination: string;
  status: string;
  createdAt: Date;
  trackingNumber: string;
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
  activeParcelTab: 'sent' | 'received' = 'sent';
  sentParcels: RecentParcel[] = [];
  receivedParcels: RecentParcel[] = [];

  loadingSent = false;
  loadingReceived = false;
  errorSent: string | null = null;
  errorReceived: string | null = null;

  modalOpen = false;
  selectedParcel: RecentParcel | null = null;

  // Modal state for history and support
  historyModalOpen = false;
  supportModalOpen = false;

  userProfile: any = null;
  userHistory: any[] = [];

  // Support form state
  supportForm = {
    name: '',
    email: '',
    message: ''
  };
  supportFormSubmitted = false;

  constructor(
    private router: Router,
    private parcelService: ParcelService,
    private contactService: ContactService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadingSent = true;
    this.loadingReceived = true;
    this.errorSent = null;
    this.errorReceived = null;

    // Fetch user profile for support form and history
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        this.userProfile = user;
        this.supportForm.name = user.name || '';
        this.supportForm.email = user.email || '';
      },
      error: () => {
        this.userProfile = null;
      }
    });

    this.parcelService.getSentParcels().subscribe({
      next: (res: any) => {
        this.sentParcels = (res.data || res).map((p: any) => ({
          id: p.id,
          recipient: p.recipient,
          destination: p.destination,
          status: p.status,
          createdAt: new Date(p.createdAt),
          trackingNumber: p.trackingNumber,
          price: p.pricing,
          estimatedDelivery: new Date(p.createdAt),
        }));
        this.loadingSent = false;
        this.updateUserHistory();
      },
      error: (err) => {
        this.errorSent = 'Failed to load sent parcels.';
        this.loadingSent = false;
      }
    });

    this.parcelService.getReceivedParcels().subscribe({
      next: (res: any) => {
        this.receivedParcels = (res.data || res).map((p: any) => ({
          id: p.id,
          recipient: p.recipient,
          destination: p.destination,
          status: p.status,
          createdAt: new Date(p.createdAt),
          trackingNumber: p.trackingNumber,
          price: p.pricing,
          estimatedDelivery: new Date(p.createdAt),
        }));
        this.loadingReceived = false;
        this.updateUserHistory();
      },
      error: (err) => {
        this.errorReceived = 'Failed to load received parcels.';
        this.loadingReceived = false;
      }
    });
  }

  updateUserHistory() {
    // Combine sent and received parcels for history
    const events: any[] = [];
    this.sentParcels.forEach((p) => {
      events.push({
        date: p.createdAt.toLocaleDateString(),
        action: 'Created parcel',
        details: `To ${p.destination} (Tracking: ${p.trackingNumber})`
      });
      if (p.status && p.status.toLowerCase() === 'delivered') {
        events.push({
          date: p.estimatedDelivery.toLocaleDateString(),
          action: 'Parcel delivered',
          details: `To ${p.destination} (Tracking: ${p.trackingNumber})`
        });
      }
    });
    this.receivedParcels.forEach((p) => {
      if (p.status && p.status.toLowerCase() === 'delivered') {
        events.push({
          date: p.estimatedDelivery.toLocaleDateString(),
          action: 'Received parcel',
          details: `From ${p.recipient} (Tracking: ${p.trackingNumber})`
        });
      }
    });
    // Sort by date descending
    this.userHistory = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

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
    // Pre-fill support form with user profile if available
    if (this.userProfile) {
      this.supportForm.name = this.userProfile.name || '';
      this.supportForm.email = this.userProfile.email || '';
    }
    this.supportModalOpen = true;
  }
  closeSupportModal(): void {
    this.supportModalOpen = false;
    this.supportFormSubmitted = false;
    this.supportForm = { name: '', email: '', message: '' };
  }

  submitSupportForm(): void {
    const payload: ContactPayload = {
      name: this.supportForm.name,
      email: this.supportForm.email,
      message: this.supportForm.message,
    };
    this.contactService.sendContact(payload).subscribe({
      next: () => {
        this.supportFormSubmitted = true;
        setTimeout(() => {
          this.closeSupportModal();
        }, 1500);
      },
      error: (err) => {
        alert('Failed to send message: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }

  setParcelTab(tab: 'sent' | 'received') {
    this.activeParcelTab = tab;
  }
}