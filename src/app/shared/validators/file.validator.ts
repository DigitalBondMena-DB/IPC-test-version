import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fileTypeValidator(allowedExtensions: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (!file || !(file instanceof File)) {
      return null;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { 
        fileType: { 
          allowedTypes: allowedExtensions.join(', '),
          actualType: extension 
        } 
      };
    }

    return null;
  };
}

export function fileSizeValidator(maxSizeInBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (!file || !(file instanceof File)) {
      return null;
    }

    if (file.size > maxSizeInBytes) {
      return { 
        fileSize: { 
          maxSize: maxSizeInBytes, 
          actualSize: file.size 
        } 
      };
    }

    return null;
  };
}
