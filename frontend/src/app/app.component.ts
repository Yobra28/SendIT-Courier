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
  }
}