import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogicSummary } from '@/features/surveys/models/survey-overview.interface';

@Component({
    selector: 'app-logic-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './logic-summary.component.html',
})
export class LogicSummaryComponent {
    logic = input.required<LogicSummary>();
}
