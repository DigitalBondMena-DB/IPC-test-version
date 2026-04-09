import {
  Component,
  input,
  output,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  effect,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IFormField } from '@shared/models/form-field.model';
import { BInputComponent } from '../b-input/b-input.component';
import { BSelectComponent } from '../b-select/b-select.component';
import { BCheckboxComponent } from '../b-checkbox/b-checkbox.component';
import { BMultiSelectComponent } from '../b-multi-select/b-multi-select.component';
import { BImageUploadComponent } from '../b-image-upload/b-image-upload.component';
import { AuthService } from '@/core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-b-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BInputComponent,
    BSelectComponent,
    BCheckboxComponent,
    BMultiSelectComponent,
    BImageUploadComponent,
  ],
  templateUrl: './b-form-builder.component.html',
  styleUrl: './b-form-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BFormBuilderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);

  // Filter fields by role
  filteredFields = computed(() => {
    const role = this._AuthService.role();
    return this.fields().filter((field) => {
      if (!field.roles || field.roles.length === 0) return true;
      return field.roles.includes(role);
    });
  });

  // Inputs
  fields = input.required<IFormField[]>();
  initialData = input<any>({});
  submitLabel = input<string>('Save Changes');
  cancelLabel = input<string>('Cancel');
  loading = input<boolean>(false);
  groupValidators = input<any[]>([]);

  // Outputs
  formSubmit = output<any>();
  formCancel = output<void>();
  onSearch = output<{ key: string; text: string }>();
  onScrollPagination = output<{ key: string; event: any }>();
  onValueChange = output<{ key: string; value: any }>();

  form!: FormGroup;

  constructor() {
    effect(() => {
      this.filteredFields();
      this.buildForm();
    });

    effect(() => {
      const data = this.initialData();
      if (this.form && data) {
        this.form.patchValue(data, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {}

  private buildForm(): void {
    const data = this.initialData() || {};

    if (!this.form) {
      const group: any = {};
      this.filteredFields().forEach((field) => {
        group[field.key] = [
          { value: data[field.key] || '', disabled: !!field.disabled },
          field.validators || [],
        ];
      });
      this.form = this.fb.group(group, { validators: this.groupValidators() });

      // Listen for changes
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.valueChanges.subscribe((value) => {
          this.onValueChange.emit({ key, value });
        });
      });
    } else {
      // Update existing controls' disabled state and add missing ones
      this.filteredFields().forEach((field) => {
        const control = this.form.get(field.key);
        if (control) {
          if (field.disabled && control.enabled) control.disable({ emitEvent: false });
          else if (!field.disabled && control.disabled) control.enable({ emitEvent: false });
        } else {
          const newControl = this.fb.control(
            { value: data[field.key] || '', disabled: !!field.disabled },
            field.validators || [],
          );
          this.form.addControl(field.key, newControl);
          newControl.valueChanges.subscribe((value) => {
            this.onValueChange.emit({ key: field.key, value });
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  getControl(key: string) {
    return this.form.get(key);
  }

  isTouched(key: string): boolean {
    return this.form.get(key)?.touched || false;
  }

  isValid(key: string): boolean {
    return this.form.get(key)?.valid || false;
  }

  getErrorMessage(field: IFormField): string | null {
    const control = this.form.get(field.key);
    if (!control || !control.touched || (control.valid && !control.hasError('passwordMismatch')))
      return null;

    if (control.hasError('required')) return `${field.label} is required`;
    if (control.hasError('email')) return 'Invalid email address';
    if (control.hasError('fileType')) {
      const allowedTypes = control.errors?.['fileType']?.allowedTypes;
      return `The ${field.label} field must be a file of type: ${allowedTypes}`;
    }
    if (control.hasError('fileSize')) {
      const maxSize = control.errors?.['fileSize']?.maxSize;
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `The ${field.label} field must not exceed ${maxSizeMB}MB`;
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${field.label} must be at least ${requiredLength} characters`;
    }
    if (control.hasError('min')) {
      const minVal = control.errors?.['min']?.min;
      return `${field.label} must be at least ${minVal}`;
    }

    return `${field.label} is invalid`;
  }
}
