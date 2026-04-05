import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { BDataTableComponent } from '@/shared/components/b-data-table/b-data-table.component';
import { ITableColumn } from '@/shared/models/table.model';
import { ReportsFiltersComponent } from '../../components/reports-filters/reports-filters.component';
import {
  LucideAngularModule,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
  Users,
  FolderOpen,
  FolderTree,
  ListTodo,
  Percent,
  Eye,
} from 'lucide-angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, BDataTableComponent, LucideAngularModule, ReportsFiltersComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent {
  private readonly reportsService = inject(ReportsService);

  // Data Resources
  readonly overviewResource = this.reportsService.getOverview(signal({})); // base load

  // Metrics (Always from overview)
  readonly metrics = computed(() => this.overviewResource.value()?.data?.metrics);
  readonly cards = computed(() => {
    const m = this.metrics();
    return [
      {
        label: 'Total Surveys',
        value: m?.total_surveys,
        icon: this.icons.TotalSurveys,
        iconTextClass: 'text-primary-500',
        iconBgClass: 'bg-gray-50',
      },
      {
        label: 'Completed',
        value: m?.completed,
        icon: this.icons.clipboardCheck,
        iconTextClass: 'text-green-500',
        iconBgClass: 'bg-green-50',
      },
      {
        label: 'Expired',
        value: m?.expired,
        icon: this.icons.clipboardX,
        iconTextClass: 'text-red-500',
        iconBgClass: 'bg-red-50',
      },
      {
        label: 'Surveyor',
        value: m?.surveyors,
        icon: this.icons.Surveyor,
        iconTextClass: 'text-amber-500',
        iconBgClass: 'bg-amber-50',
      },
      {
        label: 'Domains',
        value: m?.domains,
        icon: this.icons.folderOpen,
        iconTextClass: 'text-purple-500',
        iconBgClass: 'bg-purple-50',
      },
      {
        label: 'Sub-domains',
        value: m?.sub_domains,
        icon: this.icons.folderTree,
        iconTextClass: 'text-pink-500',
        iconBgClass: 'bg-pink-50',
      },
      {
        label: 'Questions',
        value: m?.questions,
        icon: this.icons.listTodo,
        iconTextClass: 'text-cyan-500',
        iconBgClass: 'bg-cyan-50',
      },
      {
        label: 'Av. Percentage',
        value: m?.av_percentage != null ? `${m.av_percentage}%` : undefined,
        icon: this.icons.Percentage,
        iconTextClass: 'text-orange-500',
        iconBgClass: 'bg-orange-50',
      },
    ];
  });

  // Table Data (Initial base load only)
  readonly recentSubmissions = computed(() => {
    return this.overviewResource.value()?.data?.recent_submissions || [];
  });

  readonly isLoading = computed(() => this.overviewResource.isLoading());

  // Table Config
  readonly tableColumns: ITableColumn[] = [
    { field: 'survey_name', header: 'Survey', sortable: false },
    { field: 'survivor_name', header: 'Surveyor', sortable: false },
    { field: 'submitted_at', header: 'Submitted at', sortable: false },
    { field: 'entity_name', header: 'Related to', sortable: false },
    { field: 'actions', header: 'Actions', type: 'actions', viewOnly: true, sortable: false },
  ];

  // Icons
  readonly icons = {
    TotalSurveys: ClipboardList,
    clipboardCheck: ClipboardCheck,
    clipboardX: ClipboardX,
    Surveyor: Users,
    folderOpen: FolderOpen,
    folderTree: FolderTree,
    listTodo: ListTodo,
    Percentage: Percent,
    Eye: Eye,
  };
}
