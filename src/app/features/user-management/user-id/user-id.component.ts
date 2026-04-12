import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { UserManagementService } from '../services/user-management.service';
import { BaseUser } from '../base/base-user';
import { MessageService } from 'primeng/api';
import { passwordMatchValidator } from '@shared/validators/password-match.validator';
import { BaseIdComponent } from '@shared/base/base-id-component';

@Component({
  selector: 'app-user-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  template: `
    <app-b-page-header [title]="title()" [showCreateButton]="false" />
    <div class="px-layout-x pt-2.5">
      <div class="card p-8 bg-white rounded-2xl shadow-sm overflow-x-auto min-w-[600px]">
        @if (isLoading()) {
          <div class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        } @else {
          <app-b-form-builder
            [fields]="fields()"
            [initialData]="formValues()"
            [submitLabel]="submitLabel()"
            [loading]="isSubmitting()"
            [groupValidators]="groupValidators"
            (formSubmit)="onSubmit($event)"
            (formCancel)="onCancel()"
            (onSearch)="onDropdownSearch($event)"
            (onScrollPagination)="onDropdownScroll($event)"
            (onValueChange)="onValueChange($event)"
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserIdComponent extends BaseIdComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly _Service = inject(UserManagementService);
  private readonly _MessageService = inject(MessageService);

  readonly config = inject(BaseUser);

  id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isEdit = computed(() => !!this.id());
  title = computed(() => `${this.isEdit() ? 'Edit' : 'Create'} ${this.config.entityLabel}`);
  submitLabel = computed(() => `${this.isEdit() ? 'Save Changes' : 'Create'}`);

  readonly groupValidators = [passwordMatchValidator()];

  // User data for editing
  userResource = this.isEdit()
    ? this._Service.getUserById(this.config.endpoint, this.config.userType, this.id()!)
    : null;
    
  userData = computed(() => {
    const data = this.userResource?.value();
    if (!data) return {};
    return this.isEdit() ? this.config.transformResponse(data) : data;
  });

  isLoading = computed(() => this.userResource?.isLoading() || false);

  constructor() {
    super();
    this.initDependencies(this.config.getFormFields(this.isEdit()), this._Service);

    // Sync initial user data to formValues signal (Effect is better than timeout in computed)
    effect(() => {
      const data = this.userData();
      if (data && Object.keys(data).length > 0) {
        this.formValues.set({ ...data });
      }
    });
  }

  fields = computed(() =>
    this.getAugmentedFields(this.config.getFormFields(this.isEdit()), this.isEdit()),
  );

  override onValueChange(event: { key: string; value: any }) {
    super.onValueChange(event, this.config.getFormFields(this.isEdit()));
  }

  onSubmit(formData: any): void {
    this.isSubmitting.set(true);
    const id = this.id();
    const endpoint = this.config.endpoint;
    const userType = this.config.userType;

    const payload = this.config.preparePayload(formData);

    const obs = id
      ? this._Service.updateUser(endpoint, userType, id, payload)
      : this._Service.createUser(endpoint, userType, payload);

    obs.subscribe({
      next: () => {
        this._MessageService.add({
          summary: 'Success',
          detail: `User ${id ? 'updated' : 'created'} successfully`,
        });
        this.router.navigate([this.config.navPath]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this._MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || `Failed to ${id ? 'update' : 'create'} user`,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.config.navPath]);
  }
}
