import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
// Remove: import { NgSelectModule } from '@ng-select/ng-select';

interface AdminStats {
  totalParcels: number;
  pendingParcels: number;
  inTransitParcels: number;
  deliveredParcels: number;
  totalRevenue: number;
  activeUsers: number;
}

interface ParcelOrder {
  id: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  createdAt: Date;
  trackingNumber: string;
  pricing: number;
}

// Add mock user data interface
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalPackages: number;
  status: 'Active' | 'Inactive';
  joinDate: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LeafletModule,
    // Remove: NgSelectModule, // Ensure NgSelectModule is included here
  ],
  template: `
    <nav class="admin-navbar">
      <div class="navbar-left">
        <span class="navbar-logo material-icons">inventory_2</span>
        <span class="navbar-title"><b>SendIT</b> <span style="color: #7c3aed">Admin</span></span>
      </div>
      <div class="navbar-right">
        <button class="btn btn-outline" (click)="openSettings()">
          <span class="material-icons">settings</span> Settings
        </button>
        <button class="btn btn-dark" (click)="logout()">
          <span class="material-icons">logout</span> Logout
        </button>
      </div>
    </nav>
    <div *ngIf="settingsModalOpen" class="modal-backdrop" (click)="closeSettings()">
      <div class="modal-content settings-modal" (click)="$event.stopPropagation()">
        <div class="settings-header">
          <span class="settings-title">Settings</span>
          <button class="close-btn" (click)="closeSettings()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="settings-tabs">
          <button [class.active]="settingsTab==='profile'" (click)="selectSettingsTab('profile')">Profile</button>
          <button [class.active]="settingsTab==='notifications'" (click)="selectSettingsTab('notifications')">Notifications</button>
          <button [class.active]="settingsTab==='security'" (click)="selectSettingsTab('security')">Security</button>
        </div>
        <div class="settings-content">
          <ng-container *ngIf="settingsTab==='profile'">
            <h3 class="settings-section-title"><span class="material-icons">person</span> Profile Information</h3>
            <form class="settings-form" (ngSubmit)="saveProfile()">
              <div class="settings-form-row">
                <div class="settings-form-group">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="settingsProfile.fullName" name="fullName" />
                </div>
                <div class="settings-form-group">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="settingsProfile.email" name="email" />
                </div>
              </div>
              <div class="settings-form-row">
                <div class="settings-form-group">
                  <label>Phone</label>
                  <input type="text" [(ngModel)]="settingsProfile.phone" name="phone" />
                </div>
                <div class="settings-form-group">
                  <label>Address</label>
                  <input type="text" [(ngModel)]="settingsProfile.address" name="address" />
                </div>
              </div>
              <div class="settings-form-actions">
                <button type="button" class="btn btn-outline" (click)="closeSettings()">Cancel</button>
                <button type="submit" class="btn btn-dark">Save Changes</button>
              </div>
            </form>
          </ng-container>
          <ng-container *ngIf="settingsTab==='notifications'">
            <h3 class="settings-section-title"><span class="material-icons">notifications</span> Notification Preferences</h3>
            <form class="settings-form" (ngSubmit)="saveNotifications()">
              <div class="settings-checkbox-group">
                <label><input type="checkbox" [(ngModel)]="settingsNotifications.email" name="notifEmail" /> Email Notifications</label>
                <label><input type="checkbox" [(ngModel)]="settingsNotifications.sms" name="notifSms" /> SMS Notifications</label>
                <label><input type="checkbox" [(ngModel)]="settingsNotifications.push" name="notifPush" /> Push Notifications</label>
              </div>
              <div class="settings-form-actions">
                <button type="button" class="btn btn-outline" (click)="closeSettings()">Cancel</button>
                <button type="submit" class="btn btn-dark">Save Changes</button>
              </div>
            </form>
          </ng-container>
          <ng-container *ngIf="settingsTab==='security'">
            <h3 class="settings-section-title"><span class="material-icons">security</span> Security Settings</h3>
            <form class="settings-form" (ngSubmit)="saveSecurity()">
              <button type="button" class="btn btn-light full-width">Change Password</button>
              <button type="button" class="btn btn-light full-width">Enable Two-Factor Authentication</button>
              <button type="button" class="btn btn-danger full-width">Delete Account</button>
              <div class="settings-form-actions">
                <button type="button" class="btn btn-outline" (click)="closeSettings()">Cancel</button>
                <button type="submit" class="btn btn-dark">Save Changes</button>
              </div>
            </form>
          </ng-container>
        </div>
      </div>
    </div>
    <div *ngIf="showSettingsToast" class="settings-toast">{{ settingsToastMsg }}</div>
    <div class="admin-container">
      <div class="admin-header">
        <div class="header-content">
          <div class="header-info">
            <h1>Admin Dashboard</h1>
            <p>Manage parcels and monitor system performance</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" (click)="showCreateForm = true">
              <span class="material-icons">add</span>
              Create Parcel Order
            </button>
          </div>
        </div>
        <div class="admin-tabs">
          <button [class.active]="activeTab === 'packages'" (click)="activeTab = 'packages'">Packages</button>
          <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">Users</button>
        </div>
      </div>

      <div class="admin-content">
        <ng-container *ngIf="activeTab === 'packages'">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon total">
                <span class="material-icons">inventory</span>
              </div>
              <div class="stat-info">
                <h3>{{ stats?.totalParcels }}</h3>
                <p>Total Parcels</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon pending">
                <span class="material-icons">schedule</span>
              </div>
              <div class="stat-info">
                <h3>{{ stats?.pendingParcels }}</h3>
                <p>Pending</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon transit">
                <span class="material-icons">local_shipping</span>
              </div>
              <div class="stat-info">
                <h3>{{ stats?.inTransitParcels }}</h3>
                <p>In Transit</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon delivered">
                <span class="material-icons">check_circle</span>
              </div>
              <div class="stat-info">
                <h3>{{ stats?.deliveredParcels }}</h3>
                <p>Delivered</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon revenue">
                <span class="material-icons">attach_money</span>
              </div>
              <div class="stat-info">
                <h3>\${{ (stats?.totalRevenue ?? 0).toLocaleString() }}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon users">
                <span class="material-icons">people</span>
              </div>
              <div class="stat-info">
                <h3>{{ stats?.activeUsers }}</h3>
                <p>Active Users</p>
              </div>
            </div>
          </div>

          <!-- Create Modal -->
          <div *ngIf="showCreateForm" class="modal-backdrop" (click)="showCreateForm = false">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="form-header">
                <h2>Create New Parcel Order</h2>
                <button class="close-btn" (click)="showCreateForm = false">
                  <span class="material-icons">close</span>
                </button>
              </div>
              <form [formGroup]="parcelForm" (ngSubmit)="createParcel()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="sender" class="form-label">Sender Email</label>
                    <input #senderEmailInput type="email" id="sender" class="form-control" placeholder="Enter sender email" (blur)="setSenderByEmail(senderEmailInput.value)" />
                    <div *ngIf="senderEmailError" class="text-danger">Sender email not found.</div>
                  </div>
                  <div class="form-group">
                    <label for="recipient" class="form-label">Recipient Email</label>
                    <input #recipientEmailInput type="email" id="recipient" class="form-control" placeholder="Enter recipient email" (blur)="setRecipientByEmail(recipientEmailInput.value)" />
                    <div *ngIf="recipientEmailError" class="text-danger">Recipient email not found.</div>
                  </div>
                  <div class="form-group">
                    <label for="origin" class="form-label">Pickup Location</label>
                    <input type="text" id="origin" class="form-control" placeholder="Enter pickup address" formControlName="origin" />
                  </div>
                  <div class="form-group">
                    <label for="destination" class="form-label">Destination</label>
                    <input type="text" id="destination" class="form-control" placeholder="Enter destination address" formControlName="destination" />
                  </div>
                  <div class="form-group">
                    <label for="category" class="form-label">Category</label>
                    <select id="category" class="form-control" formControlName="category">
                      <option value="">Select category</option>
                      <option value="documents">Documents</option>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="food">Food</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="pricing" class="form-label">Pricing</label>
                    <select id="pricing" class="form-control" formControlName="pricing">
                      <option [value]="500">Standard (₦500)</option>
                      <option [value]="1200">Express (₦1,200)</option>
                      <option [value]="2000">Overnight (₦2,000)</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="showCreateForm = false">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="!parcelForm.valid || isCreating">
                    <span *ngIf="isCreating" class="spinner"></span>
                    <span *ngIf="!isCreating">Create Order</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <!-- End Create Modal -->

          <!-- Edit Modal -->
          <div *ngIf="activeModal === 'edit' && selectedOrder" class="modal-backdrop" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="form-header">
                <h2>Edit Parcel Order</h2>
                <button class="close-btn" (click)="closeModal()">
                  <span class="material-icons">close</span>
                </button>
              </div>
              <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Tracking Number</label>
                    <div>{{ selectedOrder.trackingNumber }}</div>
                  </div>
                  <div class="form-group">
                    <label>Status</label>
                    <select class="form-control" formControlName="status">
                      <option value="Pending">Pending</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Pickup">Out for Pickup</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Sender</label>
                    <input class="form-control" formControlName="sender" />
                  </div>
                  <div class="form-group">
                    <label>Recipient</label>
                    <input class="form-control" formControlName="recipient" />
                  </div>
                  <div class="form-group">
                    <label>Origin</label>
                    <input class="form-control" formControlName="origin" />
                  </div>
                  <div class="form-group">
                    <label>Destination</label>
                    <input class="form-control" formControlName="destination" />
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="!editForm.valid">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
          <!-- End Edit Modal -->

          <!-- View Modal -->
          <div *ngIf="activeModal === 'view' && selectedOrder" class="modal-backdrop" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="form-header">
                <h2>Parcel Order Details</h2>
                <button class="close-btn" (click)="closeModal()">
                  <span class="material-icons">close</span>
                </button>
              </div>
              <div class="form-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="form-group"><label>Tracking Number</label>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>{{ selectedOrder.trackingNumber }}</span>
                    <button class="btn btn-xs btn-outline" style="padding: 0 0.5rem; font-size: 0.8em;" (click)="copyTrackingNumber(selectedOrder.trackingNumber)">
                      <span class="material-icons" style="font-size: 1em;">content_copy</span>
                    </button>
                  </div>
                </div>
                <div class="form-group"><label>Status</label><div>{{ selectedOrder.status }}</div></div>
                <div class="form-group"><label>Sender</label><div>{{ selectedOrder.sender }}</div></div>
                <div class="form-group"><label>Recipient</label><div>{{ selectedOrder.recipient }}</div></div>
                <div class="form-group"><label>Origin</label><div>{{ selectedOrder.origin }}</div></div>
                <div class="form-group"><label>Destination</label><div>{{ selectedOrder.destination }}</div></div>
                <div class="form-group"><label>Weight</label><div>{{ selectedOrder.weight }}kg</div></div>
                <div class="form-group"><label>Date</label><div>{{ selectedOrder.createdAt | date:'short' }}</div></div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-outline" (click)="closeModal()">Close</button>
              </div>
            </div>
          </div>
          <!-- End View Modal -->
     
           <!-- Map Modal -->
           <div *ngIf="activeModal === 'map' && selectedOrder" class="modal-backdrop" (click)="closeModal()">
             <div class="modal-content" (click)="$event.stopPropagation()">
               <div class="form-header">
                 <h2>Parcel Route Map</h2>
                 <button class="close-btn" (click)="closeModal()">
                   <span class="material-icons">close</span>
                 </button>
               </div>
               <div style="padding: 2rem; text-align: center;">
                 <div style="margin-bottom: 1rem; font-size: 1.1em;">
                   <b>{{ selectedOrder.origin }}</b>
                   <span class="material-icons" style="vertical-align: middle; font-size: 1.2em; color: var(--primary-600);">arrow_forward</span>
                   <b>{{ selectedOrder.destination }}</b>
                 </div>
                 <div style="height: 350px; width: 100%; margin: 0 auto;">
                   <ng-container *ngIf="leafletFitBounds as bounds; else noMap">
                     <div
                       leaflet
                       [leafletOptions]="leafletOptions"
                       [leafletFitBounds]="bounds"
                       [leafletLayers]="leafletLayers"
                       style="height: 100%; width: 100%; border-radius: 1rem; box-shadow: var(--shadow-md);"
                     ></div>
                   </ng-container>
                   <ng-template #noMap>
                     <div style="margin-top: 1rem; color: var(--gray-500); font-size: 0.95em;">
                       (Unable to load map for these addresses)
                     </div>
                   </ng-template>
                 </div>
               </div>
               <div class="form-actions">
                 <button type="button" class="btn btn-outline" (click)="closeModal()">Close</button>
               </div>
             </div>
           </div>
           <!-- End Map Modal -->

          <div class="orders-section">
            <div class="section-header">
              <h2>Recent Orders</h2>
              <div class="section-actions">
                <button class="btn btn-outline">
                  <span class="material-icons">download</span>
                  Export
                </button>
              </div>
            </div>
            <div class="orders-table">
              <div class="table-header">
                <div class="table-cell">Tracking #</div>
                <div class="table-cell">Sender</div>
                <div class="table-cell">Recipient</div>
                <div class="table-cell">Route</div>
                <div class="table-cell">Weight</div>
                <div class="table-cell">Status</div>
                <div class="table-cell">Pricing</div>
                <div class="table-cell">Actions</div>
              </div>
              <div class="table-row" *ngFor="let order of recentOrders">
                <div class="table-cell">
                  <span class="tracking-number">{{ order.trackingNumber }}</span>
                </div>
                <div class="table-cell">{{ order.sender }}</div>
                <div class="table-cell">{{ order.recipient }}</div>
                <div class="table-cell">
                  <div class="route">
                    <span class="origin">{{ order.origin }}</span>
                    <span class="material-icons">arrow_forward</span>
                    <span class="destination">{{ order.destination }}</span>
                  </div>
                </div>
                <div class="table-cell">{{ order.weight }}kg</div>
                <div class="table-cell">
                  <span class="status-badge" [ngClass]="'status-' + order.status.toLowerCase().replace(' ', '-')">
                    {{ order.status }}
                  </span>
                </div>
                <div class="table-cell">
                  <span class="pricing-value">₦{{ order.pricing | number:'1.0-0' }}</span>
                </div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button class="action-btn" (click)="openModal('edit', order)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="action-btn" (click)="openModal('view', order)">
                      <span class="material-icons">visibility</span>
                    </button>
                    <button class="action-btn" (click)="openModal('map', order)">
                      <span class="material-icons">map</span>
                    </button>
                    <button class="action-btn" (click)="deleteOrder(order)">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
        <ng-container *ngIf="activeTab === 'users'">
          <div class="user-management">
            <div class="user-header">
              <h2>User Management</h2>
            </div>
            <div class="users-table">
              <div class="table-header">
                <div class="table-cell">Name</div>
                <div class="table-cell">Email</div>
                <div class="table-cell">Phone</div>
                <div class="table-cell">Total Packages</div>
                <div class="table-cell">Status</div>
                <div class="table-cell">Join Date</div>
                <div class="table-cell">Actions</div>
              </div>
              <div class="table-row" *ngFor="let user of users">
                <div class="table-cell">{{ user.name }}</div>
                <div class="table-cell">{{ user.email }}</div>
                <div class="table-cell">{{ user.phone }}</div>
                <div class="table-cell">{{ user.totalPackages }}</div>
                <div class="table-cell">
                  <span class="status-badge" [ngClass]="user.status === 'Active' ? 'status-active' : 'status-inactive'">
                    {{ user.status }}
                  </span>
                </div>
                <div class="table-cell">{{ user.joinDate }}</div>
                <div class="table-cell">
                  <div class="action-buttons">
                    <button class="action-btn" (click)="deleteUser(user)"><span class="material-icons">delete</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .admin-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 16rem;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .navbar-logo {
      font-size: 2rem;
      color: #3b82f6;
    }
    .navbar-title {
      font-size: 1.3rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #333;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-dark {
      background: #111827;
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1.2rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .btn-dark:hover {
      background: #374151;
    }
    .btn-outline {
      background: #fff;
      color: #374151;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      padding: 0.5rem 1.2rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s, border 0.2s;
    }
    .btn-outline:hover {
      background: #f3f4f6;
      border-color: #c7d2fe;
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content.settings-modal {
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
      border: 1px solid #e5e7eb;
      min-width: 350px;
      max-width: 600px;
      width: 100%;
      max-height: 95vh;
      overflow-y: auto;
      position: relative;
      padding: 0;
      animation: modalIn 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.2rem 2rem 0.5rem 2rem;
      border-bottom: 1px solid #f3f4f6;
    }
    .settings-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #222;
    }
    .settings-tabs {
      display: flex;
      gap: 1rem;
      padding: 1rem 2rem 0 2rem;
      border-bottom: 1px solid #f3f4f6;
    }
    .settings-tabs button {
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      color: #6b7280;
      padding: 0.5rem 1.2rem;
      border-radius: 0.375rem 0.375rem 0 0;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .settings-tabs button.active {
      background: #ede9fe;
      color: #7c3aed;
    }
    .settings-content {
      padding: 2rem;
    }
    .settings-section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #222;
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .settings-form-row {
      display: flex;
      gap: 1.5rem;
    }
    .settings-form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .settings-form-group label {
      font-size: 0.95rem;
      color: #6b7280;
      font-weight: 500;
    }
    .settings-form-group input[type="text"],
    .settings-form-group input[type="email"] {
      padding: 0.5rem 0.8rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 1rem;
      background: #f9fafb;
      color: #222;
      outline: none;
      transition: border 0.2s;
    }
    .settings-form-group input:focus {
      border-color: #7c3aed;
    }
    .settings-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 1rem;
      color: #374151;
    }
    .settings-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn-light {
      background: #f3f4f6;
      color: #222;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      padding: 0.5rem 1.2rem;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 1rem;
      width: 100%;
      transition: background 0.2s;
    }
    .btn-light:hover {
      background: #ede9fe;
      color: #7c3aed;
    }
    .btn-danger {
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1.2rem;
      font-weight: 500;
      cursor: pointer;
      margin-bottom: 1rem;
      width: 100%;
      transition: background 0.2s;
    }
    .btn-danger:hover {
      background: #b91c1c;
    }
    .full-width {
      width: 100%;
    }
    @keyframes modalIn {
      from { transform: translateY(40px) scale(0.98); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    .admin-container {
      min-height: 100vh;
      background: var(--gray-50);
    }

    .admin-header {
      background: white;
      box-shadow: var(--shadow-sm);
      border-bottom: 1px solid var(--gray-200);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info h1 {
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .header-info p {
      color: var(--gray-600);
      margin: 0;
    }

    .header-actions .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .admin-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.total { background: var(--primary-600); }
    .stat-icon.pending { background: var(--secondary-500); }
    .stat-icon.transit { background: var(--info-500); }
    .stat-icon.delivered { background: var(--success-500); }
    .stat-icon.revenue { background: var(--secondary-600); }
    .stat-icon.users { background: var(--primary-500); }

    .stat-info h3 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .stat-info p {
      color: var(--gray-600);
      margin: 0;
      font-size: 0.875rem;
    }

    .create-form-container {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .form-header {
      padding: 1.5rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-header h2 {
      color: var(--gray-900);
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--gray-500);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .create-form {
      padding: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .form-actions {
      padding: 1.5rem;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .orders-section {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .section-header {
      padding: 1.5rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      color: var(--gray-900);
      margin: 0;
    }

    .section-actions .btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .orders-table {
      overflow-x: auto;
    }

    .table-header {
      display: grid;
      grid-template-columns: 150px 150px 150px 200px 80px 120px 120px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: var(--gray-100);
      border-bottom: 1px solid var(--gray-200);
      font-weight: 500;
      color: var(--gray-700);
    }

    .table-row {
      display: grid;
      grid-template-columns: 150px 150px 150px 200px 80px 120px 120px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--gray-200);
      align-items: center;
    }

    .table-row:hover {
      background: var(--gray-50);
    }

    .table-cell {
      color: var(--gray-800);
      font-size: 0.875rem;
    }

    .tracking-number {
      font-family: monospace;
      font-weight: 500;
      color: var(--primary-600);
    }

    .route {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    .route .material-icons {
      font-size: 1rem;
      color: var(--gray-400);
    }

    .origin, .destination {
      color: var(--gray-600);
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: 1px solid var(--gray-300);
      color: var(--gray-600);
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--gray-100);
      color: var(--gray-800);
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
    }
    .modal-content {
      background: white;
      border-radius: 1rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-200);
      min-width: 350px;
      max-width: 95vw;
      width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalIn 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes modalIn {
      from { transform: translateY(40px) scale(0.98); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
    body.modal-open {
      overflow: hidden;
    }
    /* End Modal Styles */

    /* Toast Styles */
    .settings-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #222;
      color: #fff;
      padding: 0.75rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
      z-index: 2000;
      animation: fadeInOut 2.5s;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
      10% { opacity: 1; transform: translateX(-50%) translateY(0); }
      90% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    /* End Toast Styles */

    .admin-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      margin-left: 16rem;
      margin-right: 16rem;
    }
    .admin-tabs button {
      background: #f3f4f6;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 0.5rem 0.5rem 0 0;
      font-weight: 500;
      color: #22223b;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .admin-tabs button.active {
      background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
      color: #fff;
    }
    .user-management {
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
      padding: 2rem;
      margin-top: 1rem;
    }
    .user-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .users-table {
      width: 100%;
    }
    .status-badge.status-active {
      background: #d1fae5;
      color: #059669;
      border-radius: 0.75rem;
      padding: 0.25rem 0.9rem;
      font-size: 0.95em;
      font-weight: 500;
      display: inline-block;
    }
    .status-badge.status-inactive {
      background: #fee2e2;
      color: #dc2626;
      border-radius: 0.75rem;
      padding: 0.25rem 0.9rem;
      font-size: 0.95em;
      font-weight: 500;
      display: inline-block;
    }

    @media (max-width: 1024px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .orders-table {
        font-size: 0.75rem;
      }

      .table-header,
      .table-row {
        grid-template-columns: 120px 120px 120px 160px 60px 100px 100px;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-actions {
        flex-direction: column;
      }

      .orders-table {
        overflow-x: scroll;
      }
    }
    .orders-table {
      width: 100%;
    }
    .table-header, .table-row {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      min-height: 56px;
    }
    .table-cell {
      flex: 1 1 0;
      padding: 0.75rem 0.5rem;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      min-height: 56px;
      justify-content: flex-start;
    }
    .table-cell:last-child {
      flex: 0 0 auto;
      min-width: 120px;
      justify-content: center;
    }
    .table-header .table-cell {
      font-weight: 600;
      color: #22223b;
      justify-content: flex-start;
      text-align: left;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-start;
      align-items: center;
    }
    .pricing-value {
      width: 100%;
      display: flex;
      align-items: center;
      height: 100%;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  showCreateForm = false;
  isCreating = false;
  parcelForm: FormGroup;
  editForm!: FormGroup;
  stats?: AdminStats;
  recentOrders: ParcelOrder[] = [];
  activeModal: 'edit' | 'view' | 'map' | null = null;
  selectedOrder: ParcelOrder | null = null;
  leafletOptions = {
    layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })],
    zoom: 5,
    center: L.latLng(0, 0)
  };
  leafletMarkers: L.Marker[] = [];
  leafletPolyline: L.Polyline | null = null;
  leafletFitBounds: L.LatLngBounds | null = null;
  settingsModalOpen = false;
  settingsTab: 'profile' | 'notifications' | 'security' = 'profile';
  settingsProfile = {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234 801 234 5678',
    address: '123 Lagos Street, Victoria Island'
  };
  settingsNotifications = {
    email: true,
    sms: false,
    push: true
  };
  showSettingsToast = false;
  settingsToastMsg = '';
  settingsToastTimeout: any = null;
  activeTab: 'packages' | 'users' = 'packages';
  users: AdminUser[] = [];
  addUser() { alert('Add user functionality coming soon!'); }
  viewUser(user: AdminUser) { alert('View user: ' + user.name); }
  editUser(user: AdminUser) { alert('Edit user: ' + user.name); }
  deleteUser(user: AdminUser) { alert('Delete user: ' + user.name); }
  // Remove senderSearch and recipientSearch
  // Add custom search function for ng-select
  // Remove: customUserSearchFn method
  // Remove senderSearch, recipientSearch, filteredSenderUsers, and filteredRecipientUsers
  senderEmailError: boolean = false;
  recipientEmailError: boolean = false;

  setSenderByEmail(email: string) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.parcelForm.get('sender')?.setValue(user.id);
      this.senderEmailError = false;
    } else {
      this.parcelForm.get('sender')?.setValue('');
      this.senderEmailError = true;
    }
  }

  setRecipientByEmail(email: string) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.parcelForm.get('recipient')?.setValue(user.id);
      this.recipientEmailError = false;
    } else {
      this.parcelForm.get('recipient')?.setValue('');
      this.recipientEmailError = true;
    }
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private adminService: AdminService
  ) {
    this.parcelForm = this.fb.group({
      sender: ['', Validators.required], // user ID
      recipient: ['', Validators.required], // user ID
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      category: ['', Validators.required],
      pricing: [500, Validators.required],
    });
    this.editForm = this.fb.group({
      status: ['', [Validators.required]],
      sender: ['', [Validators.required]],
      recipient: ['', [Validators.required]],
      origin: ['', [Validators.required]],
      destination: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadStats();
    this.loadParcels();
    this.loadUsers();
  }

  loadStats() {
    this.adminService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  loadParcels() {
    this.adminService.getParcels().subscribe(res => {
      this.recentOrders = res.data || res;
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(res => {
      this.users = res.data || res;
    });
  }

  createParcel(): void {
    if (this.parcelForm.valid) {
      this.isCreating = true;
      this.adminService.createParcel(this.parcelForm.value).subscribe({
        next: (newOrder) => {
          this.isCreating = false;
          this.showCreateForm = false;
          this.parcelForm.reset();
          this.loadParcels();
          this.loadStats();
        },
        error: () => {
          this.isCreating = false;
        }
      });
    }
  }

  updateStatus(orderId: string): void {
    console.log('Update status for order:', orderId);
  }

  async openModal(type: 'edit' | 'view' | 'map', order: ParcelOrder) {
    this.activeModal = type;
    this.selectedOrder = order;
    if (type === 'edit') {
      this.editForm.setValue({
        status: order.status,
        sender: order.sender,
        recipient: order.recipient,
        origin: order.origin,
        destination: order.destination,
      });
    }
    if (type === 'map') {
      await this.loadLeafletMap(order.origin, order.destination);
    }
  }

  async loadLeafletMap(origin: string, destination: string) {
    const [originLoc, destLoc] = await Promise.all([
      this.nominatimGeocode(origin),
      this.nominatimGeocode(destination)
    ]);
    if (originLoc && destLoc) {
      this.leafletOptions = {
        ...this.leafletOptions,
        center: L.latLng(originLoc.lat, originLoc.lon),
        zoom: 7
      };
      this.leafletMarkers = [
        L.marker([originLoc.lat, originLoc.lon], { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) }).bindPopup('Origin'),
        L.marker([destLoc.lat, destLoc.lon], { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) }).bindPopup('Destination')
      ];
      this.leafletPolyline = L.polyline([
        [originLoc.lat, originLoc.lon],
        [destLoc.lat, destLoc.lon]
      ], { color: 'blue' });
      this.leafletFitBounds = L.latLngBounds([
        [originLoc.lat, originLoc.lon],
        [destLoc.lat, destLoc.lon]
      ]);
    } else {
      this.leafletMarkers = [];
      this.leafletPolyline = null;
      this.leafletFitBounds = null;
    }
  }

  async nominatimGeocode(address: string): Promise<{ lat: number, lon: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
      const results = await fetch(url).then(res => res.json());
      if (results && results.length > 0) {
        return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
      }
    } catch (e) {}
    return null;
  }

  saveEdit() {
    if (this.editForm.valid && this.selectedOrder) {
      this.adminService.updateParcelStatus(this.selectedOrder.id, this.editForm.value.status).subscribe({
        next: () => {
          this.loadParcels();
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    this.activeModal = null;
    this.selectedOrder = null;
  }

  copyTrackingNumber(tracking: string) {
    navigator.clipboard.writeText(tracking);
    this.showSettingsToastMsg('Tracking number copied!');
  }

  get leafletLayers(): L.Layer[] {
    const layers: L.Layer[] = [...this.leafletMarkers];
    if (this.leafletPolyline) layers.push(this.leafletPolyline);
    return layers;
  }

  openSettings() { this.settingsModalOpen = true; this.settingsTab = 'profile'; }
  closeSettings() { this.settingsModalOpen = false; }
  selectSettingsTab(tab: 'profile' | 'notifications' | 'security') { this.settingsTab = tab; }
  saveProfile() {
    this.showSettingsToastMsg('Profile updated!');
    this.closeSettings();
  }
  saveNotifications() {
    this.showSettingsToastMsg('Notification preferences updated!');
    this.closeSettings();
  }
  saveSecurity() {
    this.showSettingsToastMsg('Security settings updated!');
    this.closeSettings();
  }
  showSettingsToastMsg(msg: string) {
    this.settingsToastMsg = msg;
    this.showSettingsToast = true;
    if (this.settingsToastTimeout) clearTimeout(this.settingsToastTimeout);
    this.settingsToastTimeout = setTimeout(() => {
      this.showSettingsToast = false;
      this.settingsToastMsg = '';
    }, 2000);
  }
  logout() {
    // Implement logout logic
    this.router.navigate(['/']);
  }

  deleteOrder(order: ParcelOrder) {
    this.adminService.deleteParcel(order.id).subscribe({
      next: () => {
        this.loadParcels();
        this.loadStats();
      }
    });
  }
}