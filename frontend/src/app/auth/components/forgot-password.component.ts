import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">📦</span>
            <h1>SendIT</h1>
          </div>
          <p class="auth-subtitle">Forgot your password?</p>
        </div>
        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-control"
              placeholder="Enter your email"
              [(ngModel)]="email"
              required
              email
            />
          </div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="isLoading || !email">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Send Reset Code</span>
          </button>
        </form>
        <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="auth-footer">
          <a routerLink="/auth/login" class="auth-link">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .auth-card { background: white; border-radius: 1rem; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); padding: 2rem; width: 100%; max-width: 400px; }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .logo { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
    .logo-icon { font-size: 2rem; }
    .logo h1 { color: var(--primary-600); font-size: 2rem; font-weight: 700; }
    .auth-subtitle { color: var(--gray-600); font-size: 1rem; }
    .auth-form { margin-bottom: 1.5rem; }
    .btn-full { width: 100%; margin-top: 1rem; }
    .success-message { color: var(--success-600); background-color: var(--success-50); border: 1px solid var(--success-200); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 1rem; text-align: center; }
    .error-message { color: #dc2626; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 1rem; text-align: center; }
    .auth-footer { text-align: center; padding-top: 1rem; border-top: 1px solid var(--gray-200); }
    .auth-link { color: var(--primary-600); text-decoration: none; font-weight: 500; }
    .auth-link:hover { text-decoration: underline; }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.authService.requestPasswordReset({ email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'A reset code has been sent to your email.';
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send reset code.';
      }
    });
  }
} 