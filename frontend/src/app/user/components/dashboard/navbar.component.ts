import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ParcelService } from '../../../shared/services/parcel.service';
import { UserService } from '../../../shared/services/user.service';

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
export class NavbarComponent implements OnInit {
  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private parcelService: ParcelService,
    private userService: UserService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.fetchAllData();
      }
    });
  }

  showNotifications = false;
  showSettingsModal = false;
  showProfileModal = false;
  settingsTab: 'profile' | 'notifications' | 'security' = 'profile';
  notifications: any[] = [];
  role: string | null = null;

  profileForm = {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+234 801 234 5678',
  };

  profileInfo = {
    initials: 'JD',
    name: 'John Doe',
    role: 'User',
    email: 'user@sendit.com',
    phone: '+234 801 234 5678',
    totalPackages: 23,
    memberSince: 'Jan 2024'
  };

  notificationPrefs = {
    email: true,
    sms: false,
    push: true
  };

  userDropdownOpen = false;
  show2FAModal = false;
  twoFAQr = '';
  twoFABase32 = '';
  twoFACode = '';
  twoFAResult: 'success' | 'failure' | '' = '';

  ngOnInit() {
    this.fetchAllData();
  }

  fetchAllData() {
    this.fetchNotifications();
    this.fetchUserProfile();
  }

  get userRole(): string | null {
    return this.role;
  }

  fetchNotifications() {
    this.parcelService.getUserNotifications().subscribe({
      next: (data: any) => {
        this.notifications = data;
      },
      error: (error) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  fetchUserProfile() {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        this.profileForm = {
          fullName: user.name,
          email: user.email,
          phone: user.phone
        };
        this.profileInfo = {
          initials: user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '',
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          totalPackages: user.totalPackages || 0,
          memberSince: user.createdAt ? (new Date(user.createdAt)).toLocaleString('default', { month: 'short', year: 'numeric' }) : '',
        };
        this.notificationPrefs = {
          email: user.notifyEmail,
          sms: user.notifySms,
          push: user.notifyPush
        };
        this.role = user.role || null;
      },
      error: (error) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    if (this.userDropdownOpen) {
      this.showNotifications = false;
      this.showSettingsModal = false;
      this.showProfileModal = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target) && this.userDropdownOpen) {
      this.userDropdownOpen = false;
    }
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.read);
  }

  get notificationUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showSettingsModal = false;
      this.showProfileModal = false;
      this.fetchNotifications();
    }
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  markAllRead() {
    this.parcelService.markAllNotificationsRead().subscribe({
      next: () => this.fetchNotifications(),
      error: () => this.fetchNotifications()
    });
  }

  openSettings() {
    this.showSettingsModal = true;
    this.showNotifications = false;
    this.showProfileModal = false;
    this.settingsTab = 'profile';
    this.fetchUserProfile();
  }

  closeSettings() {
    this.showSettingsModal = false;
  }

  setSettingsTab(tab: 'profile' | 'notifications' | 'security') {
    this.settingsTab = tab;
  }

  saveSettings() {
    this.userService.updateProfile({
      name: this.profileForm.fullName,
      email: this.profileForm.email,
      phone: this.profileForm.phone,
      notifyEmail: this.notificationPrefs.email,
      notifySms: this.notificationPrefs.sms,
      notifyPush: this.notificationPrefs.push
    }).subscribe(() => {
      this.fetchUserProfile();
      this.closeSettings();
    });
  }

  changePassword() {
    // Mock change password action
    alert('Change Password clicked');
  }

  enable2FA() {
    this.userService.setup2FA().subscribe((res: any) => {
      this.twoFAQr = res.otpauthUrl;
      this.twoFABase32 = res.base32;
      this.twoFACode = '';
      this.twoFAResult = '';
      this.show2FAModal = true;
    });
  }

  submit2FA() {
    this.userService.verify2FA(this.twoFACode).subscribe((res: any) => {
      if (res.verified) {
        this.twoFAResult = 'success';
        setTimeout(() => {
          this.show2FAModal = false;
          this.fetchUserProfile();
        }, 1500);
      } else {
        this.twoFAResult = 'failure';
      }
    });
  }

  deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    this.userService.deleteMe().subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.router.navigate(['/']);
    });
  }

  openProfile() {
    this.showProfileModal = true;
    this.showNotifications = false;
    this.showSettingsModal = false;
  }

  closeProfile() {
    this.showProfileModal = false;
  }

  goToDashboard() {
    this.router.navigate(['/user/dashboard']);
    this.userDropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
    this.userDropdownOpen = false;
  }

  encodeURIComponentUri(uri: string): string {
    return encodeURIComponent(uri);
  }
} 