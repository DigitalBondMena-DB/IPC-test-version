import { API_CONFIG } from '@/core/config/api.config';
import { HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IHomeResponse } from '../interfaces/home';
import { HttpService } from '@/core/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService extends HttpService {
  getHomeData(): HttpResourceRef<IHomeResponse | undefined> {
    return this.get<IHomeResponse>(API_CONFIG.ENDPOINTS.HOME);
  }
}
