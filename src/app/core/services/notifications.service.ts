import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
}

export interface UnreadCountResponse {
  data: {unread_count:number};
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  private http = inject(HttpClient);

  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${API_CONFIG.BASE_URL}notifications`);
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${API_CONFIG.BASE_URL}notifications/unread-count`);
  }
}
