import { HttpService } from '@/core/services/http.service';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarService extends HttpService {
  getIcon(): HttpResourceRef<{ url: string } | undefined> {
    return this.get<{ url: string } | undefined>('logo');
  }
}
