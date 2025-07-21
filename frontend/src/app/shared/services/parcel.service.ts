import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private baseUrl = `${environment.apiUrl}/parcels`;

  constructor(private http: HttpClient) {}

  getParcels() {
    return this.http.get(this.baseUrl);
  }

  getParcel(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
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
} 