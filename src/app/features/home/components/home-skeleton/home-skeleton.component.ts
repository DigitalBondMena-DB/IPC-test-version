import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-skeleton',
  template: `
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-6 animate-pulse px-layout-x pt-6">
      @for (card of cards; track $index) {
        <div
          class="lg:col-span-2 h-[184px] bg-white rounded-[23px] shadow-sm border border-gray-50 flex justify-between items-center p-8"
        >
          <div class="space-y-4">
            <div class="h-6 w-32 bg-gray-100 rounded-md"></div>
            <div class="h-10 w-24 bg-gray-100 rounded-md"></div>
          </div>
          <div class="h-32 w-32 bg-gray-100 rounded-2xl"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeSkeletonComponent {
  cards = Array(6).fill(0);
}
