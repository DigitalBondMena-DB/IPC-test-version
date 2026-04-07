import {
  Component,
  input,
  signal,
  forwardRef,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BLableComponent } from '../b-lable/b-lable.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Upload, X, Image as ImageIcon } from 'lucide-angular';

@Component({
  selector: 'app-b-image-upload',
  standalone: true,
  imports: [CommonModule, BLableComponent, ButtonModule, TooltipModule, LucideAngularModule],
  templateUrl: './b-image-upload.component.html',
  styleUrl: './b-image-upload.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BImageUploadComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BImageUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  id = input<string>('');
  label = input<string>('');
  subLable = input<string>('');
  placeholder = input<string>('Select an image');
  maxSize = input<number>(2 * 1024 * 1024); // 2MB default
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);

  previewUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  error = signal<string | null>(null);
  disabled = signal<boolean>(false);

  // Lucide Icons
  icons = {
    upload: Upload,
    remove: X,
    image: ImageIcon,
  };

  onChange: any = () => {};
  onTouched: any = () => {};

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;

    if (files && files.length > 0) {
      const file = files[0];
      this.handleFile(file);
    }
  }

  handleFile(file: File): void {
    // Reset internal error
    this.error.set(null);

    // Case 1: Invalid file type
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file (PNG, JPG, etc.)');
      return;
    }

    // Case 2: File too large
    if (file.size > this.maxSize()) {
      const sizeInMB = (this.maxSize() / (1024 * 1024)).toFixed(0);
      this.error.set(`File is too large. Maximum size is ${sizeInMB}MB`);
      return;
    }

    // Success case: Update state and notify form
    this.selectedFile.set(file);
    this.onChange(file);
    this.onTouched();

    // Create preview for UI
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.onerror = () => {
      this.error.set('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }

  // Case 3: Clearing the selection
  removeImage(event: Event): void {
    event.stopPropagation();
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.error.set(null);
    this.onChange(null);
    this.onTouched();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Handle click on the dropzone area
  triggerUpload(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.fileInput.nativeElement.click();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value instanceof File) {
      this.handleFile(value);
    } else if (typeof value === 'string' && value.trim() !== '') {
      // Existing image URL from server (edit mode)
      this.previewUrl.set(value);
    } else {
      // Handle Case 4: No file selected / resetting
      this.previewUrl.set(null);
      this.selectedFile.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
