import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { HighRiskSummary } from '@/features/surveys/models/survey-overview.interface';

@Component({
  selector: 'app-high-risk-summary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './high-risk-summary.component.html',
})
export class HighRiskSummaryComponent {
  summary = input.required<HighRiskSummary>();

  readonly alertIcon = TriangleAlert;
}
