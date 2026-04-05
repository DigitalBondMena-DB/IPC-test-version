import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-survey-steps',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="flex items-center justify-between w-full pb-2 mx-auto px-4 overflow-x-auto custom-scrollbar"
    >
      @for (step of steps; track step.id; let i = $index) {
        <div
          class="flex items-center flex-1 last:flex-none"
          [class.cursor-pointer]="i <= currentStep()"
          (click)="onStepClick(i)"
        >
          <div class="flex items-center gap-1.25">
            <div
              class="flex items-center justify-center text-sm w-6 h-6 rounded-full border transition-colors duration-200"
              [class.bg-primary-500]="i <= currentStep()"
              [class.border-primary-500]="i <= currentStep()"
              [class.text-white]="i <= currentStep()"
              [class.bg-white]="i > currentStep()"
              [class.border-gray-300]="i > currentStep()"
              [class.text-gray-400]="i > currentStep()"
            >
              @if (i < currentStep()) {
                <lucide-angular [img]="checkIcon" [size]="14" />
              } @else {
                <span class="text-xs font-semibold">{{ step.id }}</span>
              }
            </div>
            <span
              class="whitespace-nowrap font-medium transition-colors text-sm"
              [class.text-primary-500]="i === currentStep()"
              [class.text-blue-500]="i < currentStep()"
              [class.text-gray-400]="i > currentStep()"
            >
              {{ step.label }}
            </span>
          </div>

          @if (!$last) {
            <div
              class="flex-1 mx-4 h-px border-t border-dashed border-gray-300 w-[5px]"
              [class.border-primary-500]="i < currentStep()"
              [class.border-solid]="i < currentStep()"
            ></div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class SurveyStepsComponent {
  readonly checkIcon = Check;
  currentStep = input<number>(0);
  stepClick = output<number>();

  steps = [
    { id: 1, label: 'Survey Setup' },
    { id: 2, label: 'Preliminary Questions' },
    { id: 3, label: 'Structure & Graded Questions' },
    { id: 4, label: 'Conditional Logic' },
    { id: 5, label: 'Review & Publish' },
  ];

  onStepClick(index: number) {
    if (index <= this.currentStep()) {
      this.stepClick.emit(index);
    }
  }
}
