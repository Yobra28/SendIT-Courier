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
          <div class="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <a href="#faq">FAQ</a>
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

        <section id="features" class="features-section">
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

        <!-- Pricing Section -->
        <section id="pricing" class="pricing-section">
          <h2 class="section-title">Simple, Transparent Pricing</h2>
          <p class="pricing-subtitle">Choose the delivery option that best fits your needs. All plans include our core features.</p>
          <div class="pricing-cards">
            <div class="pricing-card">
              <h3>Standard</h3>
              <div class="price">₦500</div>
              <p class="plan-desc">Perfect for occasional deliveries</p>
              <ul>
                <li>✔ Up to 5kg package weight</li>
                <li>✔ Same-day delivery</li>
                <li>✔ Basic tracking</li>
                <li>✔ Email notifications</li>
                <li>✔ Insurance up to ₦10,000</li>
              </ul>
              <button class="btn btn-dark">Choose Standard</button>
            </div>
            <div class="pricing-card popular">
              <div class="most-popular">Most Popular</div>
              <h3>Express</h3>
              <div class="price">₦1,200</div>
              <p class="plan-desc">Fast delivery for urgent packages</p>
              <ul>
                <li>✔ Up to 10kg package weight</li>
                <li>✔ 2-hour delivery window</li>
                <li>✔ Real-time tracking</li>
                <li>✔ SMS & email notifications</li>
                <li>✔ Insurance up to ₦25,000</li>
                <li>✔ Priority handling</li>
              </ul>
              <button class="btn btn-gradient">Choose Express</button>
            </div>
            <div class="pricing-card">
              <h3>Overnight</h3>
              <div class="price">₦2,000</div>
              <p class="plan-desc">Next-day delivery anywhere</p>
              <ul>
                <li>✔ Up to 20kg package weight</li>
                <li>✔ Overnight delivery</li>
                <li>✔ Premium tracking</li>
                <li>✔ Multiple notifications</li>
                <li>✔ Insurance up to ₦50,000</li>
                <li>✔ Dedicated support</li>
                <li>✔ Signature confirmation</li>
              </ul>
              <button class="btn btn-dark">Choose Overnight</button>
            </div>
          </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact-section">
          <div class="contact-grid">
            <div class="contact-info">
              <div class="info-block">
                <div class="icon">📞</div>
                <div>
                  <div class="info-title">Phone</div>
                  <div>+234 (0) 123 456 7890<br/>+234 (0) 987 654 3210</div>
                </div>
              </div>
              <div class="info-block">
                <div class="icon">✉️</div>
                <div>
                  <div class="info-title">Email</div>
                  <div>info&#64;sendit.com<br/>support&#64;sendit.com</div>
                </div>
              </div>
              <div class="info-block">
                <div class="icon">📍</div>
                <div>
                  <div class="info-title">Address</div>
                  <div>123 Business District<br/>Lagos, Nigeria</div>
                </div>
              </div>
              <div class="info-block">
                <div class="icon">⏰</div>
                <div>
                  <div class="info-title">Hours</div>
                  <div>Mon - Fri: 8AM - 8PM<br/>Sat - Sun: 9AM - 6PM</div>
                </div>
              </div>
            </div>
            <form class="contact-form">
              <h3>Send us a Message</h3>
              <div class="form-row">
                <input type="text" placeholder="First Name" />
                <input type="text" placeholder="Last Name" />
              </div>
              <div class="form-row">
                <input type="email" placeholder="Email" />
                <input type="text" placeholder="Subject" />
              </div>
              <div class="form-row">
                <textarea placeholder="Tell us more about your inquiry..."></textarea>
              </div>
              <div class="form-row form-row-center">
                <button class="btn btn-gradient" type="submit">Send Message</button>
              </div>
            </form>
          </div>
        </section>

        <!-- FAQ Section -->
        <section id="faq" class="faq-section">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div class="faq-list">
            <div *ngFor="let faq of faqs; let i = index" class="faq-item" [class.active]="faqOpen[i]">
              <button class="faq-question" (click)="toggleFaq(i)">
                <span class="faq-icon">{{ faqOpen[i] ? '−' : '+' }}</span>
                {{ faq.question }}
              </button>
              <div class="faq-answer">
                <span [innerHTML]="faq.answer"></span>
              </div>
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
      background: linear-gradient(120deg, #e0e7ef 0%, #f3f4f6 60%, #2563eb 100%);
      background-blend-mode: lighten;
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
      color: #2563eb;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }
    .nav-links a {
      color: #1e293b;
      text-decoration: none;
      font-weight: 500;
      font-size: 1.08rem;
      transition: color 0.2s;
      position: relative;
    }
    .nav-links a:hover {
      color: #2563eb;
    }
    .nav-links a::after {
      content: '';
      display: block;
      width: 0;
      height: 2px;
      background: #2563eb;
      transition: width 0.2s;
      position: absolute;
      bottom: -4px;
      left: 0;
    }
    .nav-links a:hover::after {
      width: 100%;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .nav-actions .btn {
      color: #2563eb;
      border-color: #2563eb;
    }

    .nav-actions .btn-primary {
      background: #2563eb;
      color: #fff;
      border: none;
    }

    .nav-actions .btn-primary:hover {
      background: #1d4ed8;
    }

    .nav-actions .btn-outline {
      background: transparent;
      color: #2563eb;
      border: 2px solid #2563eb;
    }

    .nav-actions .btn-outline:hover {
      background: #e0e7ef;
      color: #1d4ed8;
    }

    .landing-main {
      color: #22223b;
    }

    .hero-title, .section-title, .cta-content h2 {
      color: #1e293b;
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
      background: linear-gradient(45deg, #2563eb, #3b82f6);
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
      color: #2563eb;
      border-color: #2563eb;
    }

    .hero-actions .btn-primary {
      background: #2563eb;
      color: #fff;
      border: none;
    }

    .hero-actions .btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .hero-actions .btn-outline {
      background: transparent;
      color: #2563eb;
      border: 2px solid #2563eb;
    }

    .hero-actions .btn-outline:hover {
      background: #e0e7ef;
      color: #1d4ed8;
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
      background: rgba(59, 130, 246, 0.85); /* vibrant blue */
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #fff; /* white icon */
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
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
      background: #fff;
      border: 1.5px solid #e0e7ef;
      border-radius: 1rem;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.07);
      padding: 2rem;
      text-align: center;
      transition: box-shadow 0.3s, border-color 0.3s;
    }

    .feature-card:hover {
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
      border-color: #3b82f6;
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      background: rgba(59, 130, 246, 0.85);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
      color: #fff;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.10);
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
      background: linear-gradient(45deg, #2563eb, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 1.125rem;
      opacity: 0.9;
    }

    .pricing-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 4rem 1rem;
      text-align: center;
    }

    .pricing-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 3rem;
    }

    .pricing-cards {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .pricing-card {
      background: #fff;
      border: 1.5px solid #e0e7ef;
      border-radius: 1rem;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.07);
      padding: 2.5rem 2rem;
      text-align: center;
      transition: box-shadow 0.3s, border-color 0.3s;
      width: 300px;
    }

    .pricing-card:hover {
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.12);
      border-color: #3b82f6;
    }

    .pricing-card.popular {
      border: 2px solid #3b82f6;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
    }

    .pricing-card.popular .most-popular {
      background: #3b82f6;
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .pricing-card h3 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #1e293b;
    }

    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 0.5rem;
    }

    .plan-desc {
      font-size: 1rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .pricing-card ul {
      list-style: none;
      padding: 0;
      margin-bottom: 2rem;
    }

    .pricing-card ul li {
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
      opacity: 0.9;
    }

    .pricing-card ul li:last-child {
      margin-bottom: 0;
    }

    .pricing-card .btn {
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: background 0.3s, transform 0.2s;
    }

    .pricing-card .btn-dark {
      background: #2563eb;
    }

    .pricing-card .btn-dark:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .pricing-card .btn-gradient {
      background: linear-gradient(45deg, #2563eb, #3b82f6);
    }

    .pricing-card .btn-gradient:hover {
      background: linear-gradient(45deg, #1d4ed8, #3b82f6);
      transform: translateY(-2px);
    }

    .contact-section {
      padding: 4rem 1rem;
      background: #f9fafb;
    }

    .contact-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-block {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      color: #333;
    }

    .info-block .icon {
      font-size: 2rem;
      color: #2563eb;
    }

    .info-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .contact-form {
      background: #fff;
      border: 1.5px solid #e0e7ef;
      border-radius: 1rem;
      padding: 2.5rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .contact-form h3 {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1e293b;
      text-align: left;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      width: 100%;
    }

    .form-row input,
    .form-row textarea {
      width: 100%;
      padding: 0.8rem 1rem;
      border: 1px solid #e0e7ef;
      border-radius: 0.5rem;
      font-size: 1rem;
      color: #333;
      background: #f9fafb;
      resize: none;
    }

    .form-row textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-row input:focus,
    .form-row textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-row.form-row-center {
      justify-content: center;
    }

    .contact-form .btn {
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 0.5rem;
      background: #2563eb;
      transition: background 0.3s, transform 0.2s;
      margin-top: 0.5rem;
      width: 200px;
      align-self: center;
    }

    .contact-form .btn:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
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
      color: #2563eb;
      border-color: #2563eb;
    }

    .cta-actions .btn-primary {
      background: #2563eb;
      color: #fff;
      border: none;
    }

    .cta-actions .btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
    }

    .cta-actions .btn-outline {
      background: transparent;
      color: #2563eb;
      border: 2px solid #2563eb;
    }

    .cta-actions .btn-outline:hover {
      background: #e0e7ef;
      color: #1d4ed8;
      transform: translateY(-2px);
    }

    .landing-footer {
      background: #2563eb;
      color: #fff;
      box-shadow: 0 -2px 16px rgba(37, 99, 235, 0.08);
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
      font-weight: 700;
      margin-bottom: 1rem;
      color: #fff;
    }

    .footer-section p {
      opacity: 0.9;
      line-height: 1.6;
      color: #e0e7ef;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
    }

    .footer-section ul li {
      margin-bottom: 0.5rem;
    }

    .footer-section ul li a {
      color: #fff;
      text-decoration: none;
      opacity: 0.9;
      transition: opacity 0.2s, border-bottom 0.2s;
      border-bottom: 2px solid transparent;
      padding-bottom: 2px;
    }

    .footer-section ul li a:hover {
      opacity: 1;
      border-bottom: 2px solid #fff;
    }

    .footer-bottom {
      border-top: 1px solid #3b82f6;
      padding-top: 1rem;
      text-align: center;
      color: #fff;
      font-size: 0.98rem;
      opacity: 1;
      background: transparent;
    }

    .faq-section {
      background: #fff;
      padding: 4rem 1rem;
      text-align: center;
    }
    .faq-list {
      max-width: 700px;
      margin: 2rem auto 0 auto;
      text-align: left;
    }
    .faq-item {
      border-bottom: 1px solid #e0e7ef;
      padding: 1.2rem 0;
    }
    .faq-question {
      background: none;
      border: none;
      font-size: 1.15rem;
      font-weight: 600;
      color: #2563eb;
      cursor: pointer;
      width: 100%;
      text-align: left;
      outline: none;
      transition: color 0.2s;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .faq-icon {
      display: inline-block;
      font-size: 1.3rem;
      font-weight: bold;
      color: #2563eb;
      transition: transform 0.3s, color 0.2s;
      margin-right: 0.5rem;
    }
    .faq-item.active .faq-icon {
      transform: rotate(45deg);
      color: #1d4ed8;
    }
    .faq-answer {
      display: none;
      font-size: 1rem;
      color: #22223b;
      margin-top: 0.7rem;
      padding-left: 0.5rem;
      opacity: 0.95;
    }
    .faq-item.active .faq-answer {
      display: block;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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

      .contact-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
  `]
})
export class LandingComponent {
  faqs = [
    {
      question: 'How do I track my parcel?',
      answer: `You can track your parcel in real-time using the tracking feature on our website or app. Simply enter your tracking number on the tracking page to get live updates on your parcel's location and delivery status. You will also receive notifications via email or SMS as your parcel progresses through each delivery stage.`
    },
    {
      question: 'What delivery options are available?',
      answer: `We offer three main delivery options:<ul><li><strong>Standard:</strong> Same-day delivery for packages up to 5kg, with basic tracking and email notifications.</li><li><strong>Express:</strong> Fast delivery for urgent packages up to 10kg, with a 2-hour delivery window, real-time tracking, and priority handling.</li><li><strong>Overnight:</strong> Next-day delivery for packages up to 20kg, with premium tracking, multiple notifications, and dedicated support.</li></ul>You can choose the option that best fits your needs during the booking process.`
    },
    {
      question: 'Is my package insured?',
      answer: `Yes, all packages are insured according to the plan you select:<ul><li>Standard: Up to ₦10,000</li><li>Express: Up to ₦25,000</li><li>Overnight: Up to ₦50,000</li></ul>This insurance covers loss or damage during transit. For more details, please refer to our insurance policy or contact support.`
    },
    {
      question: 'How do I contact support?',
      answer: `You can reach our support team 24/7 by:<ul><li>Calling us at +234 (0) 123 456 7890 or +234 (0) 987 654 3210</li><li>Emailing info&#64;sendit.com or support&#64;sendit.com</li><li>Filling out the contact form on this page</li></ul>Our team is always ready to assist you with any questions or issues you may have.`
    },
    {
      question: 'Can I change my delivery address after booking?',
      answer: `Yes, you can update your delivery address before your parcel is dispatched. Please contact our support team as soon as possible to make changes. Once the parcel is in transit, address changes may not be possible.`
    },
    {
      question: 'What happens if my parcel is delayed?',
      answer: `While we strive for timely deliveries, unforeseen circumstances can sometimes cause delays. If your parcel is delayed, you will receive notifications and can track its status online. Our support team is also available to provide updates and assistance.`
    }
  ];
  faqOpen = this.faqs.map(() => false);

  toggleFaq(index: number) {
    this.faqOpen[index] = !this.faqOpen[index];
  }

  constructor() {}
}