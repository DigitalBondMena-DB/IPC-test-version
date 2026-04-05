import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { OverviewHeaderComponent } from './components/overview-header/overview-header.component';
import { StructurePreviewComponent } from './components/structure-preview/structure-preview.component';
import { HighRiskSummaryComponent } from './components/high-risk-summary/high-risk-summary.component';
import { LogicSummaryComponent } from './components/logic-summary/logic-summary.component';
import { LucideAngularModule, Loader2, AlertCircle, Check } from 'lucide-angular';

@Component({
  selector: 'app-survey-overview',
  standalone: true,
  imports: [
    CommonModule,
    OverviewHeaderComponent,
    StructurePreviewComponent,
    HighRiskSummaryComponent,
    LogicSummaryComponent,
    LucideAngularModule,
  ],
  templateUrl: './survey-overview.component.html',
})
export class SurveyOverviewComponent {
  private readonly surveyService = inject(SurveyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  checkIcon = Check;
  surveyId = computed(() => {
    const parentId = this.route.parent?.snapshot.paramMap.get('id');
    const id = this.route.snapshot.paramMap.get('id');
    return parentId || id;
  });

  // The resource holding our survey data, fetching automatically based on surveyorId
  overviewResource = this.surveyService.getSurveyOverview(this.surveyId() as string);

  // Derived signals based on the resource state
  overviewData = computed(() => this.overviewResource?.value()?.data);
  isLoading = computed(() => this.overviewResource?.isLoading() ?? false);
  error = computed(() => {
    const errorState = this.overviewResource?.error();
    if (errorState) return 'Failed to load survey overview. Please try again.';
    if (!this.isLoading() && !this.overviewData() && this.surveyId())
      return 'No overview data found.';
    if (!this.surveyId()) return 'No survey ID provided.';
    return null;
  });

  readonly loaderIcon = Loader2;
  readonly alertIcon = AlertCircle;

  retryFetch(): void {
    if (this.overviewResource) {
      this.overviewResource.reload();
    }
  }

  publishSurvey(): void {
    this.router.navigate(['/survey']);
  }
}
