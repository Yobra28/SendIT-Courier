import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private baseUrl = 'https://sendit-courier-7847.onrender.com/api/parcels';

  constructor(private http: HttpClient) {
    console.log('🔍 ParcelService - Environment API URL:', environment.apiUrl);
    console.log('🔍 ParcelService - Base URL:', this.baseUrl);
    console.log('🔍 ParcelService - HARDCODED URL:', this.baseUrl);
  }

  getParcels() {
    return this.http.get(this.baseUrl);
  }

  getSentParcels() {
    return this.http.get(`${this.baseUrl}/sent`);
  }

  getReceivedParcels() {
    return this.http.get(`${this.baseUrl}/received`);
  }

  getParcel(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getParcelByTrackingNumber(trackingNumber: string) {
    return this.http.get(`${this.baseUrl}/track/${trackingNumber}`);
  }

  createParcel(parcel: any) {
    return this.http.post(this.baseUrl, parcel);
  }

  updateParcel(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteParcel(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateStatus(parcelId: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${parcelId}/status`, { status });
  }

  addTrackingStep(parcelId: string, step: { status: string; location: string; lat?: number; lng?: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${parcelId}/steps`, step);
  }

  updateCurrentLocation(parcelId: string, lat: number, lng: number) {
    return this.http.patch(`${this.baseUrl}/${parcelId}/location`, { lat, lng });
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
    return this.http.get(`${this.baseUrl}/assigned`, this.getAuthHeaders());
  }

  getUserNotifications() {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  markAllNotificationsRead() {
    return this.http.patch(`https://sendit-courier-7847.onrender.com/api/parcels/notifications/read-all`, {});
  }

  getTrackingSteps(parcelId: string) {
    return this.http.get(`${this.baseUrl}/${parcelId}/steps`);
  }
} 