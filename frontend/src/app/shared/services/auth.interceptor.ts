import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 HTTP Request:', req.method, req.url);
    console.log('🔍 HTTP Headers:', req.headers);
    
    const token = localStorage.getItem('token'); // or wherever you store the token

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('🔍 HTTP Request with token:', cloned.method, cloned.url);
      return next.handle(cloned);
    } else {
      console.log('🔍 HTTP Request without token:', req.method, req.url);
      return next.handle(req);
    }
  }
} 