import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`, { withCredentials: true });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/me`, data, { withCredentials: true });
  }

  deleteMe(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/me`, { withCredentials: true });
  }

  setup2FA() {
    return this.http.post(`${this.baseUrl}/me/2fa/setup`, {}, { withCredentials: true });
  }

  verify2FA(code: string) {
    return this.http.post(`${this.baseUrl}/me/2fa/verify`, { code }, { withCredentials: true });
  }
} 