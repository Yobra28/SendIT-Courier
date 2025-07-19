import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Notification {
  type: 'delivered' | 'in_transit' | 'delayed' | 'created';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private router: Router) {}

  showNotifications = false;
  showSettingsModal = false;
  showProfileModal = false;
  settingsTab: 'profile' | 'notifications' | 'security' = 'profile';
  notifications: Notification[] = [
    {
      type: 'delivered',
      title: 'Package Delivered',
      message: 'Your package PKG002 has been delivered successfully',
      time: '2 hours ago',
      unread: true
    },
    {
      type: 'in_transit',
      title: 'Package In Transit',
      message: 'Package PKG001 is now in transit to Abuja',
      time: '4 hours ago',
      unread: true
    },
    {
      type: 'delayed',
      title: 'Delivery Delayed',
      message: 'Package PKG003 delivery has been delayed due to weather',
      time: '1 day ago',
      unread: false
    },
    {
      type: 'created',
      title: 'New Package Created',
      message: 'A new package has been created',
      time: '',
      unread: false
    }
  ];

  profileForm = {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234 801 234 5678',
    address: '123 Lagos Street, Victoria Island'
  };

  profileInfo = {
    initials: 'JD',
    name: 'John Doe',
    role: 'User',
    email: 'user@sendit.com',
    phone: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    totalPackages: 23,
    memberSince: 'Jan 2024'
  };

  notificationPrefs = {
    email: true,
    sms: false,
    push: true
  };

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => n.unread);
  }

  get notificationUnreadCount(): number {
    return this.notifications.filter(n => n.unread).length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showSettingsModal = false;
      this.showProfileModal = false;
    }
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  markAllRead() {
    this.notifications.forEach(n => n.unread = false);
  }

  openSettings() {
    this.showSettingsModal = true;
    this.showNotifications = false;
    this.showProfileModal = false;
    this.settingsTab = 'profile';
  }

  closeSettings() {
    this.showSettingsModal = false;
  }

  setSettingsTab(tab: 'profile' | 'notifications' | 'security') {
    this.settingsTab = tab;
  }

  saveSettings() {
    // Mock save logic for all tabs
    this.closeSettings();
  }

  changePassword() {
    // Mock change password action
    alert('Change Password clicked');
  }

  enable2FA() {
    // Mock enable 2FA action
    alert('Enable Two-Factor Authentication clicked');
  }

  deleteAccount() {
    // Mock delete account action
    alert('Delete Account clicked');
  }

  openProfile() {
    this.showProfileModal = true;
    this.showNotifications = false;
    this.showSettingsModal = false;
  }

  closeProfile() {
    this.showProfileModal = false;
  }

  logout() {
    // Add any logout logic here (e.g., clearing tokens)
    this.router.navigate(['/']);
  }
} 