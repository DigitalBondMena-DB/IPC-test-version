import { ILoginResponse } from '@/features/auth/interfaces/auth';
import { Role } from '@/shared/models/users-role.model';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _Router = inject(Router);
  private readonly USERDATA_STORAGE = 'userData';
  private _userData = signal<ILoginResponse | null>(null);
  public userData = this._userData.asReadonly();
  public role = computed<Role>(() => this._userData()?.user.entity_type as Role);
  isAuthenticated = computed(() => !!this._userData()?.token);
  constructor() {
    this.initializeFromStorage();
  }
  private initializeFromStorage(): void {
    const storedUserData = localStorage.getItem(this.USERDATA_STORAGE);
    if (storedUserData) {
      this._userData.set(JSON.parse(storedUserData));
    }
  }
  setUserData(userData: ILoginResponse): void {
    this._userData.set(userData);
    localStorage.setItem(this.USERDATA_STORAGE, JSON.stringify(userData));
  }
  clearUserData(): void {
    this._userData.set(null);
    localStorage.removeItem(this.USERDATA_STORAGE);
  }
  logout(): void {
    this.clearUserData();
    this._Router.navigate(['/login']);
  }
}
