import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  constructor() {
    console.log('🚀 App Component - Environment loaded:', environment);
    console.log('🚀 App Component - API URL:', environment.apiUrl);
    console.log('🚀 App Component - Production:', environment.production);
    console.log('🚀 App Component - Build Time:', new Date().toISOString());
    console.log('🚀 App Component - Cache Bust:', Math.random());
    
    // Test API call to verify URL
    fetch('https://sendit-courier-7847.onrender.com/api/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      console.log('✅ Test API call successful:', response.status);
    }).catch(error => {
      console.log('❌ Test API call failed:', error);
    });
    
    // Force cache invalidation
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }
}