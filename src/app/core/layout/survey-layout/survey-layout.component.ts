import { Component, signal } from '@angular/core';
import { SideBarComponent } from '../main-layout/components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { MainFooterComponent } from '../main-layout/components/main-footer/main-footer.component';
import { MAIN_MENU_ITEMS } from '@/shared/models/navigation.constants';

@Component({
  selector: 'app-survey-layout',
  standalone: true,
  imports: [SideBarComponent, RouterOutlet, MainFooterComponent],
  template: `
    <div class="flex h-screen bg-[#FDFDFD] overflow-hidden">
      <!-- Sidebar -->
      <app-side-bar [menuItems]="menuItems()" />

      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Content -->
        <main class="flex-1 overflow-y-auto custom-scrollbar text-[#F5F7FA] bg-[#F5F7FA]">
          <div class="mx-auto flex flex-col justify-between min-h-full bg-[#F5F7FA]">
            <div class="flex-1">
              <router-outlet />
            </div>
            <app-main-footer />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class SurveyLayoutComponent {
  menuItems = signal(MAIN_MENU_ITEMS);
}
