import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    console.log('🔍 UserService - Environment API URL:', environment.apiUrl);
    console.log('🔍 UserService - Base URL:', this.apiUrl);
    console.log('🔍 UserService - Using Environment URL');
  }

  getProfile(): Observable<any> {
    console.log('🔍 UserService.getProfile() - URL:', `${this.apiUrl}/me`);
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }

  deleteMe(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me`);
  }

  setup2FA() {
    return this.http.post(`${this.apiUrl}/me/2fa/setup`, {});
  }

  verify2FA(code: string) {
    return this.http.post(`${this.apiUrl}/me/2fa/verify`, { code });
  }
} 