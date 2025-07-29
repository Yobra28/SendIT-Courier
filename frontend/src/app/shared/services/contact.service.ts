import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly apiUrl = 'https://sendit-courier-7847.onrender.com/api/contact';

  constructor(private http: HttpClient) {}

  sendContact(payload: ContactPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
} 