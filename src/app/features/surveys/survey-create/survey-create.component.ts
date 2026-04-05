import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { SurveyStepsComponent } from './components/survey-steps/survey-steps.component';
import { LucideAngularModule, ChevronLeft, Check } from 'lucide-angular';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';
import { SurveyService } from '../services/survey.service';

@Component({
  selector: 'app-survey-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SurveyStepsComponent,
    LucideAngularModule,
    BPageHeaderComponent,
  ],
  template: `
    <div class="h-full flex flex-col">
      <div class="bg-white">
        <app-b-page-header
          [title]="'Manage Survey'"
          createButtonLabel="Publish"
          [createButtonIcon]="checkIcon"
          (createClick)="publishSurvey()"
          [showCreateButton]="currentStep() === 4"
        />
      </div>

      <div class="bg-[#F5F7FA] mt-9 flex-1 flex flex-col overflow-hidden border border-gray-100">
        <app-survey-steps [currentStep]="currentStep()" (stepClick)="navigateToStep($event)" />

        <div class="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class SurveyCreateComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);

  readonly chevronLeftIcon = ChevronLeft;
  readonly checkIcon = Check;

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  surveyResource = this.surveyService.getSurveyById(this.id);
  surveyData = computed<any>(() => this.surveyResource.value());

  currentStep = signal(0);

  constructor() {}
  ngOnInit(): void {
    this.checkRoute();
    this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }
  checkRoute(): void {
    const url = this.router.url;
    if (url.includes('setup')) {
      this.currentStep.set(0);
    } else if (url.includes('preliminary-questions')) {
      this.currentStep.set(1);
    } else if (url.includes('structure')) {
      this.currentStep.set(2);
    } else if (url.includes('conditional-logic')) {
      this.currentStep.set(3);
    } else if (url.includes('overview')) {
      this.currentStep.set(4);
    }
  }
  navigateToStep(index: number): void {
    if (index > this.currentStep()) return;

    const routes = ['setup', 'preliminary-questions', 'structure', 'conditional-logic', 'overview'];
    const targetRoute = routes[index];
    const surveyId = this.id();

    if (surveyId) {
      this.router.navigate(['/survey', 'edit', surveyId, targetRoute]);
    } else {
      this.router.navigate(['/survey', 'create', targetRoute]);
    }
  }

  goBack() {
    this.router.navigate(['/survey']);
  }
  publishSurvey() {
    const data = this.surveyData();

    if (!data.is_active) {
      this.surveyService.toggleSurvey(this.id()!).subscribe({
        next: () => {
          this.router.navigate(['/survey']);
        },
        error: (error) => {
          console.error(error);
        },
      });
    } else {
      this.router.navigate(['/survey']);
    }
  }
}
