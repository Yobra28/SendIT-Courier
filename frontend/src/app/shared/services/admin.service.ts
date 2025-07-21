import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : {};
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`, this.getAuthHeaders());
  }

  getParcels(): Observable<any> {
    return this.http.get(`${this.apiUrl}/parcels`, this.getAuthHeaders());
  }

  createParcel(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/parcels`, data, this.getAuthHeaders());
  }

  updateParcelStatus(id: string, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/parcels/${id}/status`,
      { status },
      this.getAuthHeaders()
    );
  }

  deleteParcel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/parcels/${id}`, this.getAuthHeaders());
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, this.getAuthHeaders());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, this.getAuthHeaders());
  }
} 