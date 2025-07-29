import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://sendit-courier-7847.onrender.com/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(data: { name: string; email: string; password: string; phone?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  requestPasswordReset(data: { email: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-password-reset`, data);
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
} 