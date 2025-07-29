import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private apiUrl = `${environment.apiUrl}/parcels`;

  constructor(private http: HttpClient) {
    console.log('🔍 ParcelService - Environment API URL:', environment.apiUrl);
    console.log('🔍 ParcelService - Base URL:', this.apiUrl);
    console.log('🔍 ParcelService - Using Environment URL');
  }

  getParcels() {
    return this.http.get(this.apiUrl);
  }

  getSentParcels() {
    console.log('🔍 ParcelService.getSentParcels() - URL:', `${this.apiUrl}/sent`);
    return this.http.get(`${this.apiUrl}/sent`);
  }

  getReceivedParcels() {
    console.log('🔍 ParcelService.getReceivedParcels() - URL:', `${this.apiUrl}/received`);
    return this.http.get(`${this.apiUrl}/received`);
  }

  getParcel(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getParcelByTrackingNumber(trackingNumber: string) {
    return this.http.get(`${this.apiUrl}/track/${trackingNumber}`);
  }

  createParcel(parcel: any) {
    return this.http.post(this.apiUrl, parcel);
  }

  updateParcel(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteParcel(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStatus(parcelId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${parcelId}/status`, { status });
  }

  addTrackingStep(parcelId: string, step: { status: string; location: string; lat?: number; lng?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${parcelId}/steps`, step);
  }

  updateCurrentLocation(parcelId: string, lat: number, lng: number) {
    return this.http.patch(`${this.apiUrl}/${parcelId}/location`, { lat, lng });
  }

  geocodeAddress(address: string) {
    // Nominatim API (no key required, but rate-limited)
    return this.http.get<any>(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: 'json',
          limit: '1'
        }
      }
    );
  }

  getRouteDirections(originLat: number, originLng: number, destLat: number, destLng: number) {
    // OSRM Routing API (free, no key required)
    return this.http.get<any>(
      `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}`,
      {
        params: {
          overview: 'full',
          geometries: 'geojson'
        }
      }
    );
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  getAssignedParcels() {
    return this.http.get(`${this.apiUrl}/assigned`, this.getAuthHeaders());
  }

  getUserNotifications() {
    console.log('🔍 ParcelService.getUserNotifications() - URL:', `${this.apiUrl}/notifications`);
    return this.http.get(`${this.apiUrl}/notifications`);
  }

  markAllNotificationsRead() {
    return this.http.patch(`${this.apiUrl}/notifications/read-all`, {});
  }

  getTrackingSteps(parcelId: string) {
    return this.http.get(`${this.apiUrl}/${parcelId}/steps`);
  }
} 