import { inject, Injectable, Signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { HttpService } from '@/core/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class DropdownCascadeService {
  private readonly httpService = inject(HttpService);

  get<T>(
    endpoint: string | (() => string | undefined) | undefined,
    params?: Signal<any>
  ): HttpResourceRef<T | undefined> {
    return this.httpService.get<T>(endpoint, params);
  }
}
