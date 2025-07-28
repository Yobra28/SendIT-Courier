import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../../../shared/services/admin.service';
// Remove: import { NgSelectModule } from '@ng-select/ng-select';
// 1. Add imports for Leaflet and loading state
import * as L from 'leaflet';

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
    // Remove: LeafletModule, // Ensure NgSelectModule is included here
  ],
  template: `
    <nav class="admin-navbar">
      <div class="navbar-left">
        <span class="navbar-logo material-icons">inventory_2</span>
        <span class="navbar-title"><b>SendIT</b> <span style="color: #7c3aed">Admin</span></span>
      </div>
      <div class="navbar-right">
        <div class="navbar-user">
          <span class="user-name">Admin</span>
        </div>
        <button class="icon-btn" (click)="openSettings()" title="Settings">
          <span class="material-icons">settings</span>
        </button>
        <button class="icon-btn logout-btn" (click)="logout()" title="Logout">
          <span class="material-icons">logout</span>
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
    <div class="admin-dashboard-layout">
      <aside class="admin-sidebar">
        <button class="sidebar-btn" (click)="showCreateForm = true">
          <span class="material-icons">add</span> Create Parcel
        </button>
        <button class="sidebar-btn" (click)="showCreateCourierForm = true">
          <span class="material-icons">person_add</span> Create Courier
        </button>
        <div class="sidebar-divider"></div>
        <button class="sidebar-btn" [class.active]="activeTab === 'packages'" (click)="activeTab = 'packages'">
          <span class="material-icons">inventory</span> Packages
        </button>
        <button class="sidebar-btn" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
          <span class="material-icons">people</span> Users
        </button>
      </aside>
      <main class="admin-main-content">
        <div class="admin-header">
          <div class="header-content">
            <div class="header-info">
              <p>Manage parcels and monitor system performance</p>
            </div>
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
                  <div *ngIf="createParcelSuccess" class="success-message">{{ createParcelSuccess }}</div>
                  <div *ngIf="createParcelError" class="error-message">{{ createParcelError }}</div>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="senderEmail" class="form-label">Sender Email</label>
                      <input #senderEmailInput type="email" id="senderEmail" class="form-control" placeholder="Enter sender email" (blur)="setSenderByEmail(senderEmailInput.value)" required />
                      <div *ngIf="senderEmailError" class="text-danger">Sender email not found.</div>
                    </div>
                    <div class="form-group">
                      <label for="recipient" class="form-label">Recipient Email</label>
                      <input #recipientEmailInput type="email" id="recipient" class="form-control" placeholder="Enter recipient email" (blur)="setRecipientByEmail(recipientEmailInput.value)" required />
                      <div *ngIf="recipientEmailError" class="text-danger">Recipient email not found.</div>
                    </div>
                    <div class="form-group">
                      <label for="origin" class="form-label">Pickup Location</label>
                      <input type="text" id="origin" class="form-control" placeholder="Enter pickup address" formControlName="origin" required />
                    </div>
                    <div class="form-group">
                      <label for="destination" class="form-label">Destination</label>
                      <input type="text" id="destination" class="form-control" placeholder="Enter destination address" formControlName="destination" required />
                    </div>
                    <div class="form-group">
                      <label for="category" class="form-label">Category</label>
                      <select id="category" class="form-control" formControlName="category" required>
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
                      <select id="pricing" class="form-control" formControlName="pricing" required>
                        <option [value]="500">Standard (₦500)</option>
                        <option [value]="1200">Express (₦1,200)</option>
                        <option [value]="2000">Overnight (₦2,000)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="courier" class="form-label">Assign Courier</label>
                      <select id="courier" class="form-control" formControlName="courierId">
                        <option value="">Select courier</option>
                        <option *ngFor="let courier of couriers" [value]="courier.id">{{ courier.name }} ({{ courier.email }})</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="estimatedDelivery" class="form-label">Estimated Delivery</label>
                      <input type="datetime-local" id="estimatedDelivery" class="form-control" formControlName="estimatedDelivery" required />
                    </div>
                  </div>
                  <div class="form-actions">
                    <button type="button" class="btn btn-secondary" (click)="showCreateForm = false">Cancel</button>
                    <button type="submit" class="btn btn-primary" [disabled]="!parcelForm.valid || isCreating">
                      <span *ngIf="isCreating" class="spinner"></span>
                      <span *ngIf="!isCreating">Create Order</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

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
                  <div class="form-group"><label>Date</label><div>{{ selectedOrder.createdAt | date:'short' }}</div></div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="closeModal()">Close</button>
                </div>
              </div>
            </div>

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
                  <div style="height: 350px; width: 100%; margin: 0 auto; position: relative;">
                    <div *ngIf="mapLoading" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                      <span class="material-icons spin">autorenew</span> Loading map...
                    </div>
                    <div *ngIf="mapError" style="color: #ef4444; margin-top: 1rem;">{{ mapError }}</div>
                    <div id="parcelMap-{{selectedOrder.id}}" style="height: 350px; width: 100%; border-radius: 10px; overflow: hidden; position: absolute; top: 0; left: 0;"></div>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="closeModal()">Close</button>
                </div>
              </div>
            </div>

            <!-- Package Search and Table -->
            <div class="table-section">
              <div class="table-header-row">
                <h3>Recent Orders</h3>
                <div class="table-actions">
                  <div class="search-container">
                    <span class="material-icons search-icon">search</span>
                    <input 
                      type="text" 
                      placeholder="Search by sender, recipient, or tracking number..." 
                      [(ngModel)]="packageSearchTerm"
                      (input)="onPackageSearchChange()"
                      class="search-input"
                    />
                  </div>
                  <button class="btn btn-secondary" (click)="exportOrders()">
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
                  <div class="table-cell">Status</div>
                  <div class="table-cell">Pricing</div>
                  <div class="table-cell">Actions</div>
                </div>
                <div class="table-row" *ngFor="let order of filteredOrders">
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
                      <button class="action-btn" (click)="confirmDelete(order)">
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
                <div class="user-actions">
                  <div class="search-container">
                    <span class="material-icons search-icon">search</span>
                    <input 
                      type="text" 
                      placeholder="Search by email or name..." 
                      [(ngModel)]="userSearchTerm"
                      (input)="onUserSearchChange()"
                      class="search-input"
                    />
                  </div>
                </div>
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
                <div class="table-row" *ngFor="let user of filteredUsers">
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
      </main>
    </div>
    <div *ngIf="parcelToDelete" class="modal-backdrop" (click)="cancelDelete()">
      <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Confirm Deletion</span>
          <button class="close-btn" (click)="cancelDelete()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p style="margin: 0 0 1.2rem 0; font-size: 1rem; color: #444;">Are you sure you want to delete this parcel order?</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-danger btn-sm" (click)="deleteOrder(parcelToDelete!)">Delete</button>
        </div>
      </div>
    </div>
    <div *ngIf="showCreateCourierForm" class="modal-backdrop" (click)="showCreateCourierForm = false">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="form-header">
          <h2>Create New Courier</h2>
          <button class="close-btn" (click)="showCreateCourierForm = false">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form [formGroup]="courierForm" (ngSubmit)="createCourier()">
          <div class="form-grid">
            <div class="form-group">
              <label for="courierName" class="form-label">Name</label>
              <input type="text" id="courierName" class="form-control" formControlName="name" />
            </div>
            <div class="form-group">
              <label for="courierEmail" class="form-label">Email</label>
              <input type="email" id="courierEmail" class="form-control" formControlName="email" />
            </div>
            <div class="form-group">
              <label for="courierPhone" class="form-label">Phone</label>
              <input type="text" id="courierPhone" class="form-control" formControlName="phone" />
            </div>
            <div class="form-group">
              <label for="courierPassword" class="form-label">Password</label>
              <input type="password" id="courierPassword" class="form-control" formControlName="password" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" (click)="showCreateCourierForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!courierForm.valid || isCreatingCourier">
              <span *ngIf="isCreatingCourier" class="spinner"></span>
              <span *ngIf="!isCreatingCourier">Create Courier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <div *ngIf="userToDelete" class="modal-backdrop" (click)="cancelUserDelete()">
      <div class="modal-content delete-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">Confirm User Deletion</span>
          <button class="close-btn" (click)="cancelUserDelete()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p style="margin: 0 0 1.2rem 0; font-size: 1rem; color: #444;">
            Are you sure you want to delete user <b>{{ userToDelete.name }}</b>?
          </p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline btn-sm" (click)="cancelUserDelete()">Cancel</button>
          <button class="btn btn-danger btn-sm" (click)="confirmUserDelete()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 2rem;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
      position: sticky;
      top: 0;
      z-index: 100;
      height: 64px;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .navbar-logo {
      font-size: 2rem;
      color: #7c3aed;
    }
    .navbar-title {
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #333;
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f3f4f6;
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
    }
    .user-avatar {
      background: #ede9fe;
      color: #7c3aed;
      font-weight: 700;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .user-name {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }
    .icon-btn {
      background: none;
      border: none;
      color: #7c3aed;
      font-size: 1.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .icon-btn:hover {
      background: #ede9fe;
    }
    .logout-btn {
      color: #ef4444;
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
    .admin-dashboard-layout {
      display: flex;
      height: 100vh;
      background: #f9fafb;
    }
    .admin-sidebar {
      width: 240px;
      background: #fff;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      padding: 2rem 1rem 1rem 1rem;
      gap: 1rem;
      min-height: 100vh;
      box-shadow: 2px 0 8px 0 rgba(0,0,0,0.03);
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .sidebar-logo {
      font-size: 2rem;
      color: #7c3aed;
    }
    .sidebar-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #333;
    }
    .sidebar-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: none;
      border: none;
      font-size: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      color: #333;
      cursor: pointer;
      transition: background 0.15s;
    }
    .sidebar-btn.active, .sidebar-btn:hover {
      background: #ede9fe;
      color: #7c3aed;
    }
    .sidebar-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 1rem 0;
    }
    .admin-main-content {
      flex: 1;
      padding: 2rem 3rem;
      overflow-y: auto;
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

    .table-header, .table-row {
      display: grid;
      grid-template-columns: 150px 150px 150px 200px 120px 120px 120px;
      gap: 1rem;
      padding: 1rem 1.5rem;
      align-items: center;
    }

    @media (max-width: 900px) {
      .table-header, .table-row {
        grid-template-columns: 120px 120px 120px 150px 100px 100px 120px;
        font-size: 0.9rem;
        padding: 0.7rem 0.5rem;
      }
    }
    @media (max-width: 600px) {
      .table-header, .table-row {
        grid-template-columns: 100px 100px 100px 120px 80px 80px 120px;
        font-size: 0.8rem;
        padding: 0.5rem 0.2rem;
      }
      .action-buttons {
        flex-direction: column;
        gap: 0.3rem;
      }
    }
    .table-row {
      display: grid;
      grid-template-columns: 150px 150px 150px 200px 120px 120px 120px;
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
      flex-wrap: wrap;
      justify-content: center;
    }

    .action-btn {
      background: #f3f4f6;
      border: none;
      border-radius: 6px;
      padding: 0.4rem 0.5rem;
      font-size: 1.1rem;
      color: #22223b;
      cursor: pointer;
      transition: background 0.13s, color 0.13s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: #ede9fe;
      color: #2563eb;
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
        grid-template-columns: 120px 120px 120px 160px 100px 100px 100px;
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
    .delete-modal {
      max-width: 340px;
      padding: 1.2rem 1.5rem 1.1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      background: #fff;
      margin: 8vh auto;
      font-size: 0.98rem;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.7rem;
    }
    .modal-title {
      font-size: 1.18rem;
      font-weight: 600;
      color: #22223b;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #888;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .close-btn:hover {
      background: #f3f4f6;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .btn-sm {
      font-size: 0.92rem;
      padding: 0.38rem 1.1rem;
      border-radius: 6px;
      min-width: 80px;
      height: 38px;
      line-height: 1.2;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .orders-table {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      margin-top: 1rem;
    }

    .table-section {
      margin-top: 2rem;
    }

    .table-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .table-header-row h3 {
      margin: 0;
      color: var(--gray-800);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .table-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--gray-500);
      font-size: 1.2rem;
    }

    .search-input {
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid var(--gray-300);
      border-radius: 8px;
      font-size: 0.9rem;
      width: 300px;
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-input::placeholder {
      color: var(--gray-500);
    }

    .spinner {
      display: inline-block;
      width: 1.2em;
      height: 1.2em;
      border: 2px solid #fff;
      border-top: 2px solid #6366f1;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
      margin-right: 0.5em;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .success-message {
      color: #16a34a;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .error-message {
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    .modal-content .leaflet-container, #parcelMap {
      min-height: 350px;
      height: 350px !important;
      width: 100% !important;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 auto;
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
  // Remove: leafletOptions, leafletMarkers, leafletPolyline, leafletFitBounds fields
  settingsModalOpen = false;
  settingsTab: 'profile' | 'notifications' | 'security' = 'profile';
  settingsProfile = {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234 801 234 5678'
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
  couriers: any[] = [];
  
  // Search functionality
  packageSearchTerm: string = '';
  userSearchTerm: string = '';
  filteredOrders: ParcelOrder[] = [];
  filteredUsers: AdminUser[] = [];

  addUser() { alert('Add user functionality coming soon!'); }
  viewUser(user: AdminUser) { alert('View user: ' + user.name); }
  editUser(user: AdminUser) { alert('Edit user: ' + user.name); }
  userToDelete: AdminUser | null = null;
  senderEmailError: boolean = false;
  recipientEmailError: boolean = false;
  selectedSender: any | null = null;

  setSenderByEmail(email: string) {
    this.senderEmailError = false;
    this.selectedSender = null;
    if (!email) return;
    this.adminService.getUserByEmail(email.trim()).subscribe({
      next: (user) => {
        if (user && user.email && user.email.toLowerCase().trim() === email.trim().toLowerCase()) {
          this.selectedSender = user;
          this.senderEmailError = false;
        } else {
          this.selectedSender = null;
          this.senderEmailError = true;
        }
      },
      error: () => {
        this.selectedSender = null;
        this.senderEmailError = true;
      }
    });
  }

  setRecipientByEmail(email: string) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.parcelForm.get('recipient')?.setValue(user.id); // Set the user ID, not the email
      this.recipientEmailError = false;
    } else {
      this.parcelForm.get('recipient')?.setValue('');
      this.recipientEmailError = true;
    }
  }

  // Add state for delete confirmation
  parcelToDelete: ParcelOrder | null = null;

  // Show confirmation modal
  confirmDelete(parcel: ParcelOrder) {
    this.parcelToDelete = parcel;
  }

  // Cancel deletion
  cancelDelete() {
    this.parcelToDelete = null;
  }

  // Confirm and delete
  deleteOrder(parcel: ParcelOrder) {
    this.adminService.deleteParcel(parcel.id).subscribe({
      next: () => {
        this.loadParcels();
        this.showSettingsToastMsg('Parcel deleted successfully!');
        this.parcelToDelete = null;
      },
      error: () => {
        this.showSettingsToastMsg('Failed to delete parcel.');
        this.parcelToDelete = null;
      }
    });
  }

  showCreateCourierForm = false;
  isCreatingCourier = false;
  courierForm: FormGroup;

  createCourier() {
    if (this.courierForm.invalid) return;
    this.isCreatingCourier = true;
    const payload = { ...this.courierForm.value, role: 'COURIER' };
    this.adminService.createUser(payload).subscribe({
      next: () => {
        this.isCreatingCourier = false;
        this.showCreateCourierForm = false;
        this.courierForm.reset();
        this.loadUsers && this.loadUsers();
      },
      error: () => {
        this.isCreatingCourier = false;
        alert('Failed to create courier.');
      }
    });
  }

  mapInstance: any = null;
  mapLoading: boolean = false;
  mapError: string | null = null;
  mapSteps: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private adminService: AdminService
  ) {
    this.parcelForm = this.fb.group({
      recipient: ['', Validators.required], 
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      category: ['', Validators.required],
      pricing: [500, Validators.required],
      courierId: [''],
      estimatedDelivery: ['', Validators.required],
    });
    this.editForm = this.fb.group({
      status: ['', [Validators.required]],
      sender: ['', [Validators.required]],
      recipient: ['', [Validators.required]],
      origin: ['', [Validators.required]],
      destination: ['', [Validators.required]],
    });
    this.courierForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadStats();
    this.loadParcels();
    this.loadUsers();
    this.loadCouriers();
  }

  loadCouriers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.couriers = (res.data || res).filter((u: any) => u.role === 'COURIER');
      },
      error: () => {
        this.couriers = [];
      }
    });
  }

  loadStats() {
    this.adminService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  loadParcels() {
    this.adminService.getParcels().subscribe({
      next: (parcels) => {
        this.recentOrders = parcels;
        this.filteredOrders = [...parcels]; 
      },
      error: (error) => console.error('Error loading parcels:', error)
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe(res => {
      this.users = res.data || [];
      this.filteredUsers = [...this.users];
    });
  }

  createParcelSuccess: string = '';
  createParcelError: string = '';

  async createParcel(): Promise<void> {
    console.log('createParcel called');
    if (this.parcelForm.invalid) {
      console.log('Form is invalid', this.parcelForm.value, this.parcelForm.errors);
      return;
    }
    this.isCreating = true;
    this.createParcelSuccess = 'Parcel created successfully! 🎉';
    this.createParcelError = '';
    const formValue = this.parcelForm.value;

    if (!this.selectedSender) {
      const senderEmailInput = (document.getElementById('senderEmail') as HTMLInputElement)?.value;
      if (senderEmailInput) {
        try {
          const user = await this.adminService.getUserByEmail(senderEmailInput.trim()).toPromise();
          if (user && user.id) {
            this.selectedSender = user;
            this.senderEmailError = false;
          } else {
            this.isCreating = false;
            this.senderEmailError = true;
            this.createParcelError = 'Sender not found.';
            console.log('Sender not found');
            return;
          }
        } catch {
          this.isCreating = false;
          this.senderEmailError = true;
          this.createParcelError = 'Sender not found.';
          console.log('Sender not found (exception)');
          return;
        }
      } else {
        this.isCreating = false;
        this.senderEmailError = true;
        this.createParcelError = 'Sender email is required.';
        console.log('Sender email is required');
        return;
      }
    }
    const payload: any = {
      senderId: this.selectedSender.id,
      receiverId: formValue.recipient,
      pickupLocation: formValue.origin,
      destination: formValue.destination,
      category: formValue.category,
      pricing: parseInt(formValue.pricing, 10),
      courierId: formValue.courierId || undefined,
      estimatedDelivery: formValue.estimatedDelivery ? new Date(formValue.estimatedDelivery).toISOString() : undefined
    };
    console.log('Submitting payload to backend:', payload);
    this.adminService.createParcel(payload).subscribe({
      next: () => {
        this.isCreating = false;
        this.createParcelSuccess = 'Parcel created successfully! 🎉';
        this.createParcelError = '';
        setTimeout(() => {
          this.showCreateForm = false;
          this.parcelForm.reset();
          this.selectedSender = null;
          this.createParcelSuccess = '';
        }, 1200);
        this.loadParcels();
        this.loadStats();
      },
      error: () => {
        this.isCreating = false;
        this.createParcelError = 'Failed to create parcel. Please check all fields and try again.';
        console.log('API call failed');
      }
    });
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
      this.mapLoading = true;
      this.mapError = null;
      this.mapSteps = [];
      // Remove: setTimeout(() => this.initMap(), 100);
      if (this.mapInstance) {
        this.mapInstance.remove();
        this.mapInstance = null;
      }
      try {
        // 1. Fetch tracking steps for the parcel
        const steps: any = await this.fetchTrackingSteps(order.id);
        // 2. Geocode all step locations
        const geocodedSteps = await Promise.all(steps.map(async (step: any) => {
          let coords = null;
          if (step.lat && step.lng) {
            coords = { lat: step.lat, lng: step.lng };
          } else if (step.location) {
            coords = await this.geocodeAddress(step.location);
          }
          return { ...step, coords };
        }));
        this.mapSteps = geocodedSteps.filter(s => s.coords);
        setTimeout(() => this.renderMap(), 500); // Increased delay for modal rendering
      } catch (e) {
        this.mapError = 'Failed to load tracking steps or map.';
      } finally {
        this.mapLoading = false;
      }
    }
  }

  // Fetch tracking steps from backend (try AdminService, fallback to ParcelService)
  async fetchTrackingSteps(parcelId: string): Promise<any[]> {
    try {
      const res: any = await this.adminService.getParcelTrackingSteps(parcelId).toPromise();
      return res.data || res || [];
    } catch {
      // fallback: try ParcelService if needed
      return [];
    }
  }

  // Geocode address to {lat, lng}
  async geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
    try {
      const res: any = await this.http.get<any>(
        `https://nominatim.openstreetmap.org/search`,
        { params: { q: address, format: 'json', limit: '1' } }
      ).toPromise();
      if (res && res.length > 0) {
        return { lat: parseFloat(res[0].lat), lng: parseFloat(res[0].lon) };
      }
    } catch {}
    return null;
  }

  // Render the map with all steps
  renderMap() {
    if (!this.mapSteps.length || !this.selectedOrder) return;
    const mapId = `parcelMap-${this.selectedOrder.id}`;
    // Destroy previous map instance if exists
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
    setTimeout(() => {
      const firstStep = this.mapSteps[0];
      const map = L.map(mapId).setView([firstStep.coords.lat, firstStep.coords.lng], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      this.mapSteps.forEach((step: any) => {
        if (step.coords) {
          L.marker([step.coords.lat, step.coords.lng]).addTo(map)
            .bindPopup(step.status + '<br>' + step.location);
        }
      });
      if (this.mapSteps.length > 1) {
        const latlngs = this.mapSteps.map((s: any) => s.coords && [s.coords.lat, s.coords.lng]).filter(Boolean);
        L.polyline(latlngs, { color: 'blue' }).addTo(map);
      }
      map.invalidateSize();
      this.mapInstance = map;
    }, 350);
  }

  saveEdit() {
    if (this.editForm.valid && this.selectedOrder) {
      const formValue = this.editForm.value;
      const updatePayload: any = {
        origin: formValue.origin,
        destination: formValue.destination,
        pricing: formValue.pricing,
        estimatedDelivery: formValue.estimatedDelivery,
        courierId: formValue.courierId
      };
      this.adminService.updateParcel(this.selectedOrder.id, updatePayload).subscribe({
        next: () => {
          if (formValue.status && this.selectedOrder && formValue.status !== this.selectedOrder.status) {
            this.adminService.updateParcelStatus(this.selectedOrder.id, formValue.status).subscribe({
              next: () => {
                this.loadParcels();
                this.showSettingsToastMsg('Parcel updated successfully!');
                this.closeModal();
              }
            });
          } else {
            this.loadParcels();
            this.showSettingsToastMsg('Parcel updated successfully!');
            this.closeModal();
          }
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

  openSettings() {
    this.settingsModalOpen = true;
    this.settingsTab = 'profile';
    this.adminService.getProfile().subscribe({
      next: (profile) => {
        this.settingsProfile = {
          fullName: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || ''
        };
      }
    });
  }
  closeSettings() { this.settingsModalOpen = false; }
  selectSettingsTab(tab: 'profile' | 'notifications' | 'security') { this.settingsTab = tab; }
  saveProfile() {
    const payload: any = {
      name: this.settingsProfile.fullName?.trim() || '',
      email: this.settingsProfile.email?.trim() || '',
      phone: this.settingsProfile.phone?.trim() || ''
    };
    // Remove empty optional fields
    if (!payload.phone) delete payload.phone;
    // Validate required fields
    if (!payload.name || !payload.email) {
      this.showSettingsToastMsg('Name and email are required.');
      return;
    }
    console.log('PATCH /users/me payload:', payload);
    this.adminService.updateProfile(payload).subscribe({
      next: () => {
        this.showSettingsToastMsg('Profile updated successfully!');
        this.closeSettings();
      },
      error: () => {
        this.showSettingsToastMsg('Failed to update profile.');
      }
    });
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
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  exportOrders() {
    if (!this.recentOrders || this.recentOrders.length === 0) {
      this.showSettingsToastMsg('No orders to export.');
      return;
    }
    const headers = ['Tracking #', 'Sender', 'Recipient', 'Origin', 'Destination', 'Status', 'Pricing'];
    const rows = this.recentOrders.map(order => [
      order.trackingNumber,
      order.sender,
      order.recipient,
      order.origin,
      order.destination,
      order.status,
      order.pricing
    ]);
    const csvContent = [headers, ...rows]
      .map(e => e.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent-orders.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Show confirmation modal for user deletion
  deleteUser(user: AdminUser) {
    this.userToDelete = user;
  }

  // Cancel user deletion
  cancelUserDelete() {
    this.userToDelete = null;
  }

  // Confirm and delete user
  confirmUserDelete() {
    if (!this.userToDelete) return;
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.loadUsers();
        this.showSettingsToastMsg('User deleted successfully!');
        this.userToDelete = null;
      },
      error: () => {
        this.showSettingsToastMsg('Failed to delete user.');
        this.userToDelete = null;
      }
    });
  }

  // Search methods
  filterPackages() {
    if (!this.packageSearchTerm.trim()) {
      this.filteredOrders = [...this.recentOrders];
    } else {
      const searchTerm = this.packageSearchTerm.toLowerCase();
      this.filteredOrders = this.recentOrders.filter(order => 
        order.sender.toLowerCase().includes(searchTerm) ||
        order.recipient.toLowerCase().includes(searchTerm) ||
        order.trackingNumber.toLowerCase().includes(searchTerm)
      );
    }
  }

  filterUsers() {
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const searchTerm = this.userSearchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  onPackageSearchChange() {
    this.filterPackages();
  }

  onUserSearchChange() {
    this.filterUsers();
  }
}