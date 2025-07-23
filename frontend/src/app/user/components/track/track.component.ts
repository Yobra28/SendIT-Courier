// Add this at the top of the file to fix linter errors for Leaflet usage
import * as L from 'leaflet';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ParcelService } from '../../../shared/services/parcel.service';

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
          <div class="header-row">
            <button class="btn btn-outline back-btn" (click)="goToDashboard()">
              <span class="material-icons">arrow_back</span> Back to Dashboard
            </button>
            <div class="header-center">
              <h1>Track Your Parcel</h1>
              <p>Enter your tracking number to see real-time updates</p>
            </div>
          </div>
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

          <!-- Remove isAdmin, newStep, isAddingStep, addTrackingStep -->
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
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      margin-bottom: 0.5rem;
    }
    .header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1 1 auto;
    }
    .header-center h1 {
      margin: 0;
      color: var(--gray-900);
      font-size: 2.2rem;
      font-weight: 700;
      text-align: center;
    }
    .header-center p {
      color: var(--gray-600);
      margin: 0;
      text-align: center;
    }
    .header-row .back-btn {
      margin-bottom: 0;
      flex-shrink: 0;
    }
    @media (max-width: 900px) {
      .header-row {
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }
      .header-center h1 {
        font-size: 1.5rem;
      }
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
  // Remove isAdmin, newStep, isAddingStep, addTrackingStep

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private parcelService: ParcelService
  ) {
    // Check if tracking number was passed via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const trackingParam = urlParams.get('tracking');
    if (trackingParam) {
      this.trackingNumber = trackingParam;
      this.trackParcel();
    }
  }

  ngAfterViewInit() {
    // this.renderLeafletMap(); // Removed as per edit hint
  }

  ngOnDestroy() {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    this.leafletPolyline = null;
    this.leafletMarkers = [];
  }

  async renderMap() {
    let origin = this.trackingResult?.origin || '';
    let destination = this.trackingResult?.destination || '';
    if (origin && !origin.toLowerCase().includes('kenya')) origin += ', Kenya';
    if (destination && !destination.toLowerCase().includes('kenya')) destination += ', Kenya';
    const [originRes, destRes] = await Promise.all([
      this.parcelService.geocodeAddress(origin).toPromise(),
      this.parcelService.geocodeAddress(destination).toPromise()
    ]);
    if (!originRes.length || !destRes.length) return;
    const originCoords: [number, number] = [parseFloat(originRes[0].lat), parseFloat(originRes[0].lon)];
    const destCoords: [number, number] = [parseFloat(destRes[0].lat), parseFloat(destRes[0].lon)];
    setTimeout(() => {
      if (this.leafletMap) {
        this.leafletMap.remove();
        this.leafletMap = null;
      }
      // Find latest step with lat/lng
      const latestStep = this.trackingResult?.steps?.slice().reverse().find((s: any) => s.lat && s.lng);
      if (latestStep) {
        const liveCoords: [number, number] = [latestStep.lat, latestStep.lng];
        this.leafletMap = L.map('liveMap', {
          center: liveCoords,
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.leafletMap);
        L.marker(liveCoords, {
          title: 'Current Location',
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
            className: 'latest-location-marker'
          })
        }).addTo(this.leafletMap!);
      } else {
        // Fallback: show route from origin to destination
        this.leafletMap = L.map('liveMap', {
          center: originCoords,
          zoom: 6,
          zoomControl: false,
          attributionControl: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.leafletMap);
        this.leafletPolyline = L.polyline([originCoords, destCoords], { color: '#2563eb', weight: 4 }).addTo(this.leafletMap);
        L.marker(originCoords, {
          title: 'Origin',
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
          })
        }).addTo(this.leafletMap!);
        L.marker(destCoords, {
          title: 'Destination',
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
          })
        }).addTo(this.leafletMap!);
        this.leafletMap.fitBounds(this.leafletPolyline.getBounds(), { padding: [30, 30] });
      }
    }, 0);
  }

  trackParcel(): void {
    if (!this.trackingNumber) return;
    this.isLoading = true;
    this.showNoResult = false;
    this.trackingResult = null;
    this.parcelService.getParcelByTrackingNumber(this.trackingNumber.trim()).subscribe({
      next: async (res: any) => {
        if (res && !res.message) {
          const steps = Array.isArray(res.steps) && res.steps.length > 0 ? res.steps.map((step: any) => ({
            status: step.status,
            description: step.description,
            location: step.location,
            timestamp: new Date(step.timestamp),
            completed: step.completed,
            lat: step.lat,
            lng: step.lng
          })) : [
            {
              status: res.status,
              description: `Current status: ${res.status}`,
              location: res.destination,
              timestamp: new Date(res.createdAt),
              completed: res.status === 'DELIVERED',
              lat: null,
              lng: null
            },
          ];
          this.trackingResult = {
            recipient: res.recipient,
            destination: res.destination,
            origin: res.origin || res.pickupLocation, // Fallback to pickupLocation if origin is missing
            trackingNumber: res.trackingNumber,
            status: res.status,
            steps,
          };
          this.isLoading = false;
          await this.renderMap();
        } else {
          this.isLoading = false;
          this.showNoResult = true;
        }
      },
      error: () => {
        this.isLoading = false;
        this.showNoResult = true;
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
  }

  // Update renderLeafletMap to show only the route between sender and receiver
  // async renderLeafletMap() { // Removed as per edit hint
  //   setTimeout(async () => { // Removed as per edit hint
  //     let coords: [number, number][] = []; // Removed as per edit hint
  //     if (this.trackingResult && this.trackingResult.origin && this.trackingResult.destination) { // Removed as per edit hint
  //       try { // Removed as per edit hint
  //         const [originRes, destRes] = await Promise.all([ // Removed as per edit hint
  //           this.parcelService.geocodeAddress(this.trackingResult.origin).toPromise(), // Removed as per edit hint
  //           this.parcelService.geocodeAddress(this.trackingResult.destination).toPromise() // Removed as per edit hint
  //         ]); // Removed as per edit hint
  //         if (originRes && originRes.length && destRes && destRes.length) { // Removed as per edit hint
  //           const originCoords: [number, number] = [parseFloat(originRes[0].lat), parseFloat(originRes[0].lon)]; // Removed as per edit hint
  //           const destCoords: [number, number] = [parseFloat(destRes[0].lat), parseFloat(destRes[0].lon)]; // Removed as per edit hint
  //           coords = [originCoords, destCoords]; // Removed as per edit hint
  //         } // Removed as per edit hint
  //       } catch (e) { // Removed as per edit hint
  //         // Geocoding failed // Removed as per edit hint
  //         coords = []; // Removed as per edit hint
  //       } // Removed as per edit hint
  //     } // Removed as per edit hint
  //     if (!document.getElementById('liveMap')) return; // Removed as per edit hint
  //     if (!coords.length) return; // Removed as per edit hint
  //     if (this.leafletMap) { // Removed as per edit hint
  //       this.leafletMap.remove(); // Removed as per edit hint
  //       this.leafletMap = null; // Removed as per edit hint
  //     } // Removed as per edit hint
  //     this.leafletMap = L.map('liveMap', { // Removed as per edit hint
  //       center: coords[0], // Removed as per edit hint
  //       zoom: 6, // Removed as per edit hint
  //       zoomControl: false, // Removed as per edit hint
  //       attributionControl: false, // Removed as per edit hint
  //     }); // Removed as per edit hint
  //     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Removed as per edit hint
  //       maxZoom: 19, // Removed as per edit hint
  //     }).addTo(this.leafletMap); // Removed as per edit hint
  //     // Draw polyline // Removed as per edit hint
  //     this.leafletPolyline = L.polyline(coords, { color: '#2563eb', weight: 4 }).addTo(this.leafletMap); // Removed as per edit hint
  //     // Add markers for sender and receiver // Removed as per edit hint
  //     L.marker(coords[0], { title: 'Sender' }).addTo(this.leafletMap!); // Removed as per edit hint
  //     L.marker(coords[1], { title: 'Receiver' }).addTo(this.leafletMap!); // Removed as per edit hint
  //     this.leafletMap.fitBounds(this.leafletPolyline.getBounds(), { padding: [30, 30] }); // Removed as per edit hint
  //   }, 0); // Removed as per edit hint
  // } // Removed as per edit hint
}