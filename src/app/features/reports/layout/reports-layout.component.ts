import { Component, signal } from '@angular/core';
import { SideBarComponent } from '@/core/layout/main-layout/components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { MainFooterComponent } from '@/core/layout/main-layout/components/main-footer/main-footer.component';
import { MAIN_MENU_ITEMS } from '@/shared/models/navigation.constants';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';

@Component({
  selector: 'app-reports-layout',
  imports: [SideBarComponent, RouterOutlet, MainFooterComponent, BPageHeaderComponent],
  template: `
    <div class="flex h-screen bg-[#FDFDFD] overflow-hidden">
      <!-- Sidebar -->
      <app-side-bar [menuItems]="menuItems()" />

      <!-- Main Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <app-b-page-header title="Reports" [showCreateButton]="false" />
        <!-- Content -->
        <main class="flex-1 overflow-y-auto px-8 pt-4 custom-scrollbar text-[#F5F7FA] bg-[#F5F7FA]">
          <div class="mx-auto flex flex-col justify-between min-h-full">
            <div class="flex-1">
              <router-outlet />
            </div>
            <app-main-footer />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
    `,
  ],
})
export class ReportsLayoutComponent {
  menuItems = signal(MAIN_MENU_ITEMS);
}
