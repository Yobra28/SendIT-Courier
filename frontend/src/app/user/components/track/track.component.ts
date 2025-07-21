// Add this at the top of the file to fix linter errors for Leaflet usage
import * as L from 'leaflet';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface TrackingStep {
  status: string;
  description: string;
  location: string;
  timestamp: Date;
  completed: boolean;
}

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="track-container">
      <div class="track-header">
        <div class="header-content">
          <button class="btn btn-outline back-btn" (click)="goToDashboard()">
            <span class="material-icons">arrow_back</span> Back to Dashboard
          </button>
          <h1>Track Your Parcel</h1>
          <p>Enter your tracking number to see real-time updates</p>
        </div>
      </div>

      <div class="track-content">
        <div class="tracking-form">
          <div class="form-group">
            <label for="trackingNumber" class="form-label">Tracking Number</label>
            <div class="input-group">
              <input
                type="text"
                id="trackingNumber"
                class="form-control"
                placeholder="Enter tracking number (e.g., ST123456789)"
                [(ngModel)]="trackingNumber"
                (keyup.enter)="trackParcel()"
              />
              <button class="btn btn-primary" (click)="trackParcel()" [disabled]="!trackingNumber || isLoading">
                <span *ngIf="isLoading" class="spinner"></span>
                <span *ngIf="!isLoading" class="material-icons">search</span>
                <span *ngIf="!isLoading">Track</span>
              </button>
            </div>
          </div>
        </div>

        <div class="tracking-result" *ngIf="trackingResult">
          <div class="result-header">
            <div class="parcel-info">
              <h2>{{ trackingResult.recipient }}</h2>
              <p>{{ trackingResult.destination }}</p>
              <span class="tracking-id">{{ trackingResult.trackingNumber }}</span>
            </div>
            <div class="current-status">
              <span class="status-badge" [ngClass]="'status-' + trackingResult.status.toLowerCase().replace(' ', '-')">
                {{ trackingResult.status }}
              </span>
            </div>
          </div>

          <div class="tracking-timeline">
            <div class="timeline-item" *ngFor="let step of trackingResult.steps" [class.completed]="step.completed">
              <div class="timeline-marker">
                <span class="material-icons" *ngIf="step.completed">check_circle</span>
                <span class="material-icons" *ngIf="!step.completed">radio_button_unchecked</span>
              </div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <h4>{{ step.status }}</h4>
                  <span class="timestamp">{{ step.timestamp | date:'short' }}</span>
                </div>
                <p>{{ step.description }}</p>
                <span class="location">{{ step.location }}</span>
              </div>
            </div>
          </div>

          <div class="tracking-map">
            <div id="liveMap" style="width:100%;height:320px;border-radius:8px;"></div>
          </div>
        </div>

        <div class="no-result" *ngIf="showNoResult">
          <div class="no-result-icon">
            <span class="material-icons">search_off</span>
          </div>
          <h3>Tracking number not found</h3>
          <p>Please check your tracking number and try again</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-container {
      min-height: 100vh;
      background: var(--gray-50);
    }

    .track-header {
      background: white;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--gray-200);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      text-align: center;
    }

    .header-content h1 {
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .header-content p {
      color: var(--gray-600);
      margin: 0;
    }

    .track-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .tracking-form {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      gap: 1rem;
    }

    .input-group .form-control {
      flex: 1;
    }

    .input-group .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .tracking-result {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
    }

    .result-header {
      padding: 2rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .parcel-info h2 {
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .parcel-info p {
      color: var(--gray-600);
      margin-bottom: 0.5rem;
    }

    .tracking-id {
      font-family: monospace;
      font-size: 0.875rem;
      color: var(--gray-500);
      background: var(--gray-100);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }

    .tracking-timeline {
      padding: 2rem;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 1rem;
      top: 2.5rem;
      width: 2px;
      height: calc(100% - 1rem);
      background: var(--gray-300);
    }

    .timeline-item.completed::after {
      background: var(--primary-500);
    }

    .timeline-marker {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--gray-300);
      color: var(--gray-600);
    }

    .timeline-item.completed .timeline-marker {
      background: var(--primary-500);
      color: white;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .timeline-header h4 {
      color: var(--gray-900);
      margin: 0;
    }

    .timestamp {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .timeline-content p {
      color: var(--gray-600);
      margin-bottom: 0.5rem;
    }

    .location {
      font-size: 0.875rem;
      color: var(--gray-500);
      font-style: italic;
    }

    .tracking-map {
      padding: 2rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
    }

    .map-placeholder {
      text-align: center;
      padding: 3rem;
      background: var(--gray-100);
      border-radius: 0.5rem;
      border: 2px dashed var(--gray-300);
    }

    .map-placeholder .material-icons {
      font-size: 3rem;
      color: var(--gray-400);
      margin-bottom: 1rem;
    }

    .map-placeholder p {
      color: var(--gray-500);
      margin-bottom: 1rem;
    }

    .no-result {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
    }

    .no-result-icon {
      font-size: 4rem;
      color: var(--gray-400);
      margin-bottom: 1rem;
    }

    .no-result h3 {
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    .no-result p {
      color: var(--gray-500);
      margin: 0;
    }

    .back-btn {
      margin-bottom: 1.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 1rem;
      color: #2563eb;
      border: 1px solid #2563eb;
      background: #fff;
      border-radius: 8px;
      padding: 0.4rem 1.1rem;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .back-btn:hover {
      background: #2563eb;
      color: #fff;
    }
    .back-btn .material-icons {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .input-group {
        flex-direction: column;
      }

      .result-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .timeline-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class TrackComponent implements AfterViewInit, OnDestroy {
  trackingNumber = '';
  isLoading = false;
  showNoResult = false;
  trackingResult: any = null;
  private leafletMap: L.Map | null = null;
  private leafletPolyline: L.Polyline | null = null;
  private leafletMarkers: L.Marker[] = [];
  private mapInitialized = false;

  constructor(private sanitizer: DomSanitizer, private router: Router) {
    // Check if tracking number was passed via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParam = urlParams.get('tracking');
    if (trackingParam) {
      this.trackingNumber = trackingParam;
      this.trackParcel();
    }
  }

  ngAfterViewInit() {
    this.renderLeafletMap();
  }

  ngOnDestroy() {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    this.leafletPolyline = null;
    this.leafletMarkers = [];
  }

  trackParcel(): void {
    if (!this.trackingNumber) return;

    this.isLoading = true;
    this.showNoResult = false;
    this.trackingResult = null;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      const tn = this.trackingNumber.trim().toUpperCase();
      if (tn === 'SENT123456') {
        this.trackingResult = {
          recipient: 'John Doe',
          destination: 'Lagos, NG',
          trackingNumber: this.trackingNumber,
          status: 'Delivered',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Abuja, NG', timestamp: new Date('2025-01-10T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Abuja, NG', timestamp: new Date('2025-01-10T10:00:00'), completed: true },
            { status: 'In Transit', description: 'On the way to Lagos', location: 'Onitsha, NG', timestamp: new Date('2025-01-11T09:00:00'), completed: true },
            { status: 'Delivered', description: 'Package delivered', location: 'Lagos, NG', timestamp: new Date('2025-01-12T15:00:00'), completed: true }
          ]
        };
      } else if (tn === 'SENT654321') {
        this.trackingResult = {
          recipient: 'Mike Smith',
          destination: 'Chicago, IL',
          trackingNumber: this.trackingNumber,
          status: 'Pending',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Los Angeles, CA', timestamp: new Date('2025-01-14T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Los Angeles, CA', timestamp: new Date('2025-01-14T10:30:00'), completed: true },
            { status: 'Pending', description: 'Awaiting pickup by courier', location: 'Los Angeles, CA', timestamp: new Date('2025-01-14T12:00:00'), completed: false }
          ]
        };
      } else if (tn === 'RECV789012') {
        this.trackingResult = {
          recipient: 'Sarah Johnson',
          destination: 'Abuja, NG',
          trackingNumber: this.trackingNumber,
          status: 'In Transit',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Port Harcourt, NG', timestamp: new Date('2025-01-13T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Port Harcourt, NG', timestamp: new Date('2025-01-13T10:00:00'), completed: true },
            { status: 'In Transit', description: 'On the way to Abuja', location: 'Lokoja, NG', timestamp: new Date('2025-01-14T09:00:00'), completed: true },
            { status: 'In Transit', description: 'Approaching Abuja', location: 'Abuja, NG', timestamp: new Date('2025-01-15T12:00:00'), completed: false }
          ]
        };
      } else if (tn === 'RECV210987') {
        this.trackingResult = {
          recipient: 'Emily Davis',
          destination: 'Ibadan, NG',
          trackingNumber: this.trackingNumber,
          status: 'Processing',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Kano, NG', timestamp: new Date('2025-01-12T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Kano, NG', timestamp: new Date('2025-01-12T10:00:00'), completed: false }
          ]
        };
      } else if (tn === 'ST123456789') {
        this.trackingResult = {
          recipient: 'Sarah Johnson',
          destination: 'New York, NY',
          trackingNumber: this.trackingNumber,
          status: 'In Transit',
          steps: [
            { status: 'Package Received', description: 'Your package has been received at our facility', location: 'San Francisco, CA', timestamp: new Date('2025-01-15T08:00:00'), completed: true },
            { status: 'Processing', description: 'Package is being processed and prepared for shipment', location: 'San Francisco, CA', timestamp: new Date('2025-01-15T10:30:00'), completed: true },
            { status: 'In Transit', description: 'Package is on its way to destination', location: 'Denver, CO', timestamp: new Date('2025-01-16T14:20:00'), completed: true },
            { status: 'Out for Delivery', description: 'Package is out for delivery', location: 'New York, NY', timestamp: new Date('2025-01-17T09:00:00'), completed: false },
            { status: 'Delivered', description: 'Package has been delivered', location: 'New York, NY', timestamp: new Date('2025-01-17T15:00:00'), completed: false }
          ]
        };
      } else if (tn === 'ST123456790') {
        this.trackingResult = {
          recipient: 'Emily Davis',
          destination: 'Chicago, IL',
          trackingNumber: this.trackingNumber,
          status: 'Delivered',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Los Angeles, CA', timestamp: new Date('2025-01-14T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Los Angeles, CA', timestamp: new Date('2025-01-14T10:30:00'), completed: true },
            { status: 'In Transit', description: 'On the way to Chicago', location: 'St. Louis, MO', timestamp: new Date('2025-01-15T09:00:00'), completed: true },
            { status: 'Delivered', description: 'Package delivered', location: 'Chicago, IL', timestamp: new Date('2025-01-16T15:00:00'), completed: true }
          ]
        };
      } else if (tn === 'ST123456791') {
        this.trackingResult = {
          recipient: 'David Wilson',
          destination: 'Miami, FL',
          trackingNumber: this.trackingNumber,
          status: 'Delivered',
          steps: [
            { status: 'Package Received', description: 'Package received at facility', location: 'Seattle, WA', timestamp: new Date('2025-01-13T08:00:00'), completed: true },
            { status: 'Processing', description: 'Processing for shipment', location: 'Seattle, WA', timestamp: new Date('2025-01-13T10:00:00'), completed: true },
            { status: 'In Transit', description: 'On the way to Miami', location: 'Atlanta, GA', timestamp: new Date('2025-01-14T09:00:00'), completed: true },
            { status: 'Delivered', description: 'Package delivered', location: 'Miami, FL', timestamp: new Date('2025-01-15T15:00:00'), completed: true }
          ]
        };
      } else {
        this.showNoResult = true;
      }
      this.renderLeafletMap();
    }, 1500);
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  getStepCoordinates(): [number, number][] {
    // Mock: return coordinates for each step (San Francisco, Denver, New York)
    return [
      [37.7749, -122.4194], // San Francisco
      [39.7392, -104.9903], // Denver
      [40.7128, -74.0060]  // New York
    ];
  }

  renderLeafletMap() {
    setTimeout(() => {
      const coords = this.getStepCoordinates();
      if (!document.getElementById('liveMap')) return;
      if (!coords.length) return;
      if (this.leafletMap) {
        this.leafletMap.remove();
        this.leafletMap = null;
      }
      this.leafletMap = L.map('liveMap', {
        center: coords[coords.length - 1],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.leafletMap);
      // Draw polyline
      this.leafletPolyline = L.polyline(coords, { color: '#2563eb', weight: 4 }).addTo(this.leafletMap);
      // Add markers
      this.leafletMarkers = coords.map((coord, idx) =>
        L.marker(coord, { title: `Step ${idx + 1}` }).addTo(this.leafletMap!)
      );
      this.leafletMap.fitBounds(this.leafletPolyline.getBounds(), { padding: [30, 30] });
    }, 0);
  }
}