import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

interface MockUser {
  email: string;
  password: string;
  role: 'user' | 'admin';
  name: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container" [ngClass]="{'modal-bg': inModal}">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">📦</span>
            <h1>SendIT</h1>
          </div>
          <p class="auth-subtitle">Sign in to your account</p>
        </div>
        
        <div class="demo-credentials">
          <h3>Demo Credentials</h3>
          <div class="credentials-grid">
            <div class="credential-card">
              <h4>👤 User Account</h4>
              <p><strong>Email:</strong> user&#64;sendit.com</p>
              <p><strong>Password:</strong> user123</p>
              <button class="btn-demo" (click)="fillCredentials('user')">Use User Login</button>
            </div>
            <div class="credential-card">
              <h4>👨‍💼 Admin Account</h4>
              <p><strong>Email:</strong> admin&#64;sendit.com</p>
              <p><strong>Password:</strong> admin123</p>
              <button class="btn-demo" (click)="fillCredentials('admin')">Use Admin Login</button>
            </div>
          </div>
        </div>
        
        <form class="auth-form" #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
          <div class="error-message" *ngIf="loginError">
            {{ loginError }}
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-control"
              placeholder="Enter your email"
              [(ngModel)]="loginData.email"
              required
              email
              #email="ngModel"
            />
            <div class="error-message" *ngIf="email.invalid && email.touched">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-control"
              placeholder="Enter your password"
              [(ngModel)]="loginData.password"
              required
              minlength="6"
              #password="ngModel"
            />
            <div class="error-message" *ngIf="password.invalid && password.touched">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <div class="checkbox-group">
              <input type="checkbox" id="remember" [(ngModel)]="loginData.remember" name="remember">
              <label for="remember">Remember me</label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="!loginForm.valid || isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Sign In</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register" class="auth-link">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
      padding: 1rem;
    }
    .auth-container.modal-bg {
      background: none !important;
      box-shadow: none !important;
      min-height: unset !important;
      padding: 0 !important;
    }
    .auth-container.modal-bg .auth-card {
      background: #fff;
      box-shadow: 0 8px 32px rgba(30,41,59,0.18), 0 1.5px 8px rgba(0,0,0,0.08);
    }

    .auth-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 500px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo h1 {
      color: var(--primary-600);
      font-size: 2rem;
      font-weight: 700;
    }

    .auth-subtitle {
      color: var(--gray-600);
      font-size: 1rem;
    }

    .demo-credentials {
      background: var(--gray-50);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--gray-200);
    }

    .demo-credentials h3 {
      color: var(--gray-800);
      margin-bottom: 1rem;
      font-size: 1.125rem;
      text-align: center;
    }

    .credentials-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .credential-card {
      background: white;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--gray-200);
      text-align: center;
    }

    .credential-card h4 {
      color: var(--gray-800);
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
    }

    .credential-card p {
      font-size: 0.75rem;
      color: var(--gray-600);
      margin-bottom: 0.5rem;
    }

    .btn-demo {
      background: var(--primary-100);
      color: var(--primary-700);
      border: 1px solid var(--primary-200);
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }

    .btn-demo:hover {
      background: var(--primary-200);
      border-color: var(--primary-300);
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .checkbox-group label {
      margin: 0;
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .btn-full {
      width: 100%;
      margin-top: 1rem;
    }

    .auth-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
    }

    .auth-link {
      color: var(--primary-600);
      text-decoration: none;
      font-weight: 500;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
        margin: 0.5rem;
      }

      .credentials-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  @Input() inModal = false;

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  isLoading = false;
  loginError = '';

  constructor(private router: Router, private authService: AuthService) {}

  fillCredentials(type: 'user' | 'admin'): void {
    if (type === 'user') {
      this.loginData.email = 'user@sendit.com';
      this.loginData.password = 'user123';
    } else {
      this.loginData.email = 'admin@sendit.com';
      this.loginData.password = 'admin123';
    }
    this.loginError = '';
  }

  onLogin(form: any) {
    console.log('Submitting login form', form);
    if (form.valid) {
      this.isLoading = true;
      this.loginError = '';
      console.log('Login attempt:', this.loginData);
      this.authService.login({
        email: this.loginData.email,
        password: this.loginData.password
      }).subscribe({
        next: (res) => {
          console.log('Login observable next');
          this.isLoading = false;
          console.log('Login success:', res);
          // Store token/user info as needed
          localStorage.setItem('token', res.token);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
          // Navigate based on real backend user role
          if (res.user.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        },
        error: (err) => {
          console.log('Login observable error');
          this.isLoading = false;
          console.error('Login error:', err);
          this.loginError = err.error?.message || 'Login failed. Please try again.';
        },
        complete: () => {
          console.log('Login observable complete');
        }
      });
    } else {
      console.log('Login form is invalid', form);
    }
  }
}