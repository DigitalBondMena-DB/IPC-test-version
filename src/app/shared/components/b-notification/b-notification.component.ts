import {
  Component,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  DestroyRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell } from 'lucide-angular';
import { NotificationsService, Notification } from '@/core/services/notifications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-b-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './b-notification.component.html',
  styleUrl: './b-notification.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BNotificationComponent implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly bellIcon = Bell;

  isDropdownOpen = signal<boolean>(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);

  private unreadCountPollingInterval: number | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.isDropdownOpen();
      if (isOpen) {
        this.stopUnreadCountPolling();
      } else {
        this.startUnreadCountPolling();
      }
    });
  }

  ngOnInit(): void {
    // Load unread count initially
    this.loadUnreadCount();
    // Start polling when component initializes (dropdown is closed)
    this.startUnreadCountPolling();
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update((value) => !value);
    this.unreadCount.set(0);
    // Load notifications when opening dropdown
    if (this.isDropdownOpen()) {
      this.loadNotifications();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  private loadNotifications(): void {
    this.notificationsService
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.notifications.set(response.data);
          // Update unread count from notifications
          const unreadNotifications = response.data.filter((n) => !n.is_read);
          this.unreadCount.set(unreadNotifications.length);
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
        },
      });
  }

  private loadUnreadCount(): void {
    this.notificationsService
      .getUnreadCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.unreadCount.set(response.data.unread_count);
        },
        error: (error) => {
          console.error('Failed to load unread count:', error);
        },
      });
  }

  private startUnreadCountPolling(): void {
    if (this.unreadCountPollingInterval !== null) {
      return; // Already polling
    }

    // Poll unread count every 10 seconds
    this.unreadCountPollingInterval = window.setInterval(() => {
      this.loadUnreadCount();
    }, 10000);
  }

  private stopUnreadCountPolling(): void {
    if (this.unreadCountPollingInterval !== null) {
      clearInterval(this.unreadCountPollingInterval);
      this.unreadCountPollingInterval = null;
    }
  }

  onNotificationClick(notification: Notification): void {
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
    this.closeDropdown();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Fallback to formatted date
    const datePipe = new DatePipe('en-US');
    return datePipe.transform(date, 'short') || dateString;
  }

  ngOnDestroy(): void {
    this.stopUnreadCountPolling();
  }
}
