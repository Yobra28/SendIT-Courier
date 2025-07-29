import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container" [ngClass]="{'modal-bg': inModal}">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">📦</span>
            <h1>SendIT</h1>
          </div>
          <p class="auth-subtitle">Create your account</p>
        </div>
        
        <form class="auth-form" [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input
              type="text"
              id="firstName"
              class="form-control"
              placeholder="Enter your first name"
              formControlName="firstName"
              [class.error]="getFieldError('firstName')"
            />
            <div class="error-message" *ngIf="getFieldError('firstName')">
              <span *ngIf="registerForm.get('firstName')?.errors?.['required']">First name is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              class="form-control"
              placeholder="Enter your last name"
              formControlName="lastName"
              [class.error]="getFieldError('lastName')"
            />
            <div class="error-message" *ngIf="getFieldError('lastName')">
              <span *ngIf="registerForm.get('lastName')?.errors?.['required']">Last name is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              class="form-control"
              placeholder="Enter your email"
              formControlName="email"
              [class.error]="getFieldError('email')"
            />
            <div class="error-message" *ngIf="getFieldError('email')">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              class="form-control"
              placeholder="Enter your phone number"
              formControlName="phone"
              [class.error]="getFieldError('phone')"
            />
            <div class="error-message" *ngIf="getFieldError('phone')">
              <span *ngIf="registerForm.get('phone')?.errors?.['required']">Phone number is required</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-control"
              placeholder="Create a password"
              formControlName="password"
              [class.error]="getFieldError('password')"
            />
            <div class="error-message" *ngIf="getFieldError('password')">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              class="form-control"
              placeholder="Confirm your password"
              formControlName="confirmPassword"
              [class.error]="getFieldError('confirmPassword')"
            />
            <div class="error-message" *ngIf="getFieldError('confirmPassword')">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</span>
              <span *ngIf="registerForm.errors?.['passwordMismatch']">Passwords do not match</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full" [disabled]="!registerForm.valid || isLoading">
            <span *ngIf="isLoading" class="spinner"></span>
            <span *ngIf="!isLoading">Create Account</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a (click)="openLogin.emit()" class="auth-link">Sign in</a></p>
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
      max-width: 600px;
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

    .auth-form {
      margin-bottom: 1.5rem;
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
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  @Input() inModal = false;
  @Output() openLogin = new EventEmitter<void>();
  @Output() registrationSuccess = new EventEmitter<void>();
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onRegister() {
    console.log('onRegister called', this.registerForm.value, this.registerForm.valid);
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError = '';
      const { firstName, lastName, email, phone, password } = this.registerForm.value;
      const registerPayload = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password,
        role: 'USER'
      };
      console.log('Register attempt:', registerPayload);
      this.authService.register(registerPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log('Register success:', res);
          // Emit registration success event
          this.registrationSuccess.emit();
          // Route back to landing page instead of standalone login
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Register error:', err);
          this.registerError = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}