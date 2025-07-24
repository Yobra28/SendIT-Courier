import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParcelService } from '../../../shared/services/parcel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-courier-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courier-navbar.component.html',
  styleUrls: ['./navbar.component.css'] // reuse user navbar styles for consistency
})
export class CourierNavbarComponent implements OnInit {
  showNotifications = false;
  showProfileModal = false;
  notifications: any[] = [];
  userDropdownOpen = false;
  profileInfo = {
    initials: '',
    name: '',
    role: 'Courier',
    email: '',
    phone: ''
  };

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private parcelService: ParcelService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.fetchNotifications();
    this.fetchUserProfile();
  }

  fetchNotifications() {
    this.parcelService.getUserNotifications().subscribe((data: any) => {
      this.notifications = data;
    });
  }

  fetchUserProfile() {
    this.userService.getProfile().subscribe((user: any) => {
      this.profileInfo = {
        initials: user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '',
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone
      };
    });
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    if (this.userDropdownOpen) {
      this.showNotifications = false;
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
      this.showProfileModal = false;
      this.fetchNotifications();
    }
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.fetchNotifications();
  }

  openProfile() {
    this.showProfileModal = true;
    this.showNotifications = false;
  }

  closeProfile() {
    this.showProfileModal = false;
  }

  goToDashboard() {
    this.router.navigate(['/user/courier/dashboard']);
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