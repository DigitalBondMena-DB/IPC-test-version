import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyOverview } from '@/features/surveys/models/survey-overview.interface';
import { LucideAngularModule, View } from "lucide-angular";

@Component({
    selector: 'app-overview-header',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './overview-header.component.html',
})
export class OverviewHeaderComponent {
    overview = input.required<SurveyOverview>();
    readonly viewIcon = View;
}
