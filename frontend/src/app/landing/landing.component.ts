import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-container">
      <nav class="landing-nav">
        <div class="nav-content">
          <div class="logo">
            <span class="logo-icon">📦</span>
            <span class="logo-text">SendIT</span>
          </div>
          <div class="nav-actions">
            <button class="btn btn-outline" routerLink="/auth/login">Sign In</button>
            <button class="btn btn-primary" routerLink="/auth/register">Get Started</button>
          </div>
        </div>
      </nav>

      <main class="landing-main">
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                Fast, Reliable
                <span class="highlight">Parcel Delivery</span>
                Service
              </h1>
              <p class="hero-description">
                Send and track your parcels with ease. Our advanced logistics network ensures 
                your packages reach their destination safely and on time.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary btn-large" routerLink="/auth/register">
                  <span class="material-icons">send</span>
                  Start Shipping
                </button>
                <button class="btn btn-outline btn-large" routerLink="/auth/login">
                  <span class="material-icons">search</span>
                  Track Package
                </button>
              </div>
            </div>
            <div class="hero-visual">
              <div class="delivery-illustration">
                <div class="truck">
                  <span class="material-icons">local_shipping</span>
                </div>
                <div class="package">
                  <span class="material-icons">inventory_2</span>
                </div>
                <div class="destination">
                  <span class="material-icons">location_on</span>
                </div>
                <div class="delivery-path"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="features-section">
          <div class="features-content">
            <h2 class="section-title">Why Choose SendIT?</h2>
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">
                  <span class="material-icons">speed</span>
                </div>
                <h3>Fast Delivery</h3>
                <p>Express delivery options with same-day and next-day shipping available nationwide.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <span class="material-icons">track_changes</span>
                </div>
                <h3>Real-time Tracking</h3>
                <p>Track your parcels in real-time with detailed updates and location information.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <span class="material-icons">security</span>
                </div>
                <h3>Secure & Safe</h3>
                <p>Your packages are protected with insurance coverage and secure handling protocols.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">
                  <span class="material-icons">support_agent</span>
                </div>
                <h3>24/7 Support</h3>
                <p>Our customer support team is available around the clock to assist you.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="stats-section">
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-number">1M+</div>
              <div class="stat-label">Packages Delivered</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Happy Customers</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">Delivery Success Rate</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Customer Support</div>
            </div>
          </div>
        </section>

        <section class="cta-section">
          <div class="cta-content">
            <h2>Ready to Start Shipping?</h2>
            <p>Join thousands of satisfied customers who trust SendIT for their delivery needs.</p>
            <div class="cta-actions">
              <button class="btn btn-primary btn-large" routerLink="/auth/register">
                Create Account
              </button>
              <button class="btn btn-outline btn-large" routerLink="/auth/login">
                Sign In
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-section">
            <div class="logo">
              <span class="logo-icon">📦</span>
              <span class="logo-text">SendIT</span>
            </div>
            <p>Fast, reliable parcel delivery service you can trust.</p>
          </div>
          <div class="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#">Express Delivery</a></li>
              <li><a href="#">Standard Shipping</a></li>
              <li><a href="#">International</a></li>
              <li><a href="#">Bulk Orders</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Track Package</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 SendIT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .landing-nav {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .nav-actions .btn {
      color: white;
      border-color: white;
    }

    .nav-actions .btn-primary {
      background: white;
      color: var(--primary-600);
    }

    .nav-actions .btn-primary:hover {
      background: var(--gray-100);
    }

    .nav-actions .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .landing-main {
      color: white;
    }

    .hero-section {
      padding: 4rem 1rem;
      min-height: 80vh;
      display: flex;
      align-items: center;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    .highlight {
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-description {
      font-size: 1.25rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .hero-actions .btn {
      color: white;
      border-color: white;
    }

    .hero-actions .btn-primary {
      background: white;
      color: var(--primary-600);
    }

    .hero-actions .btn-primary:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
    }

    .hero-actions .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .delivery-illustration {
      position: relative;
      width: 300px;
      height: 200px;
    }

    .truck, .package, .destination {
      position: absolute;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      animation: float 3s ease-in-out infinite;
    }

    .truck {
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      animation-delay: 0s;
    }

    .package {
      left: 50%;
      top: 20%;
      transform: translateX(-50%);
      animation-delay: 1s;
    }

    .destination {
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      animation-delay: 2s;
    }

    .delivery-path {
      position: absolute;
      top: 50%;
      left: 30px;
      right: 30px;
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 1px;
    }

    .delivery-path::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0;
      background: white;
      border-radius: 1px;
      animation: progress 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(-50%) scale(1); }
      50% { transform: translateY(-60%) scale(1.1); }
    }

    @keyframes progress {
      0% { width: 0; }
      100% { width: 100%; }
    }

    .features-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 4rem 1rem;
    }

    .features-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .feature-card p {
      opacity: 0.9;
      line-height: 1.6;
    }

    .stats-section {
      padding: 4rem 1rem;
    }

    .stats-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 1.125rem;
      opacity: 0.9;
    }

    .cta-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 4rem 1rem;
      text-align: center;
    }

    .cta-content {
      max-width: 600px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-actions .btn {
      color: white;
      border-color: white;
    }

    .cta-actions .btn-primary {
      background: white;
      color: var(--primary-600);
    }

    .cta-actions .btn-primary:hover {
      background: var(--gray-100);
      transform: translateY(-2px);
    }

    .cta-actions .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .landing-footer {
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      padding: 3rem 1rem 1rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .footer-section p {
      opacity: 0.8;
      line-height: 1.6;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin-bottom: 0.5rem;
    }

    .footer-section ul li a {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .footer-section ul li a:hover {
      opacity: 1;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 1rem;
      text-align: center;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .nav-content {
        flex-direction: column;
        gap: 1rem;
      }

      .hero-actions,
      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .btn-large {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }
    }
  `]
})
export class LandingComponent {
  constructor() {}
}