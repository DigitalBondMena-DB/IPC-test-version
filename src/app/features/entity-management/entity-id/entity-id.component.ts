import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BPageHeaderComponent } from '@shared/components/b-page-header/b-page-header.component';
import { BFormBuilderComponent } from '@shared/components/b-form-builder/b-form-builder.component';
import { EntityManagementService } from '../services/entity-management.service';
import { MessageService } from 'primeng/api';
import { BaseEntity } from '../base/base-entity';

import { BaseIdComponent } from '@shared/base/base-id-component';

@Component({
  selector: 'app-entity-id',
  standalone: true,
  imports: [CommonModule, BPageHeaderComponent, BFormBuilderComponent],
  templateUrl: './entity-id.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityIdComponent extends BaseIdComponent {
  private readonly _Service = inject(EntityManagementService);
  private readonly _MessageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly config = inject(BaseEntity);

  readonly id = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEdit = computed(() => !!this.id());

  readonly title = computed(
    () => `${this.isEdit() ? 'Edit ' : 'Create '} ${this.config.entityLabel}`,
  );
  readonly submitLabel = computed(() => `${this.isEdit() ? 'Save Changes ' : 'Create '}`);

  // Entity data for editing
  entityResource = this._Service.getEntityById(
    () => this.config.endpoint,
    () => this.config.entity_type,
    () => this.id(),
  );

  entityData = computed(() => {
    const data = this.entityResource?.value();
    if (!data) return {};
    return this.config.transformResponse(data);
  });

  isLoading = computed(() => (this.entityResource ? this.entityResource.isLoading() : false));

  constructor() {
    super();
    this.initDependencies(this.config.getFormFields(this.isEdit()), this._Service);

    // Sync initial entity data to formValues signal
    effect(() => {
      const data = this.entityData();
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
    const payload = this.config.preparePayload(formData);

    const obs = this.isEdit()
      ? this._Service.updateEntity(
          this.config.endpoint,
          this.config.entity_type,
          this.id()!,
          payload,
        )
      : this._Service.createEntity(this.config.endpoint, this.config.entity_type, payload);

    obs.subscribe({
      next: () => {
        this._MessageService.add({ summary: 'Success', detail: 'Saved successfully' });
        this.router.navigate([this.config.navPath]);
      },
    });
  }

  onCancel(): void {
    this.router.navigate([this.config.navPath]);
  }
}
