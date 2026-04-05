import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight, ChevronDown } from 'lucide-angular';
import { SurveyDomain } from '@/features/surveys/models/survey-overview.interface';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';

@Component({
  selector: 'app-structure-preview',
  standalone: true,
  imports: [
    CommonModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    LucideAngularModule,
  ],
  templateUrl: './structure-preview.component.html',
  styles: [
    `
      ::ng-deep .p-accordion-header-link {
        background: white !important;
        border: 1px solid #f3f4f6 !important;
        border-radius: 0.5rem !important;
        padding: 1rem !important;
      }
      ::ng-deep .p-accordion-tab-active .p-accordion-header-link {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-bottom: none !important;
      }
      ::ng-deep .p-accordion-content {
        border: 1px solid #f3f4f6 !important;
        border-top: none !important;
        border-bottom-left-radius: 0.5rem !important;
        border-bottom-right-radius: 0.5rem !important;
        padding: 0 !important;
      }
    `,
  ],
})
export class StructurePreviewComponent {
  domains = input.required<SurveyDomain[]>();

  readonly chevronRightIcon = ChevronRight;
  readonly chevronDownIcon = ChevronDown;
}
