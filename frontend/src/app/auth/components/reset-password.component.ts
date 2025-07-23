import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
          <p class="auth-subtitle">Reset your password</p>
        </div>
        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="code" class="form-label">Reset Code</label>
            <input
              type="text"
              id="code"
              name="code"
              class="form-control"
              placeholder="Enter the 6-digit code"
              [(ngModel)]="code"
              required
              maxlength="6"
              minlength="6"
            />
          </div>
          <div class="form-group">
            <label for="newPassword" class="form-label">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              class="form-control"
              placeholder="Enter new password"
              [(ngModel)]="newPassword"
              required
              minlength="6"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              class="form-control"
              placeholder="Confirm new password"
              [(ngModel)]="confirmPassword"
              required
              minlength="6"
            />
          </div>
          <button type="submit" class="btn btn-primary btn-full" [disabled]="isLoading || !canSubmit()">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Reset Password</span>
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
export class ResetPasswordComponent {
  code = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    // Optionally pre-fill email from query param
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        // Optionally store or display email
      }
    });
  }

  canSubmit() {
    return this.code.length === 6 && this.newPassword.length >= 6 && this.newPassword === this.confirmPassword;
  }

  onSubmit() {
    if (!this.canSubmit()) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.authService.resetPassword({ token: this.code, newPassword: this.newPassword }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password has been reset. You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password.';
      }
    });
  }
} 