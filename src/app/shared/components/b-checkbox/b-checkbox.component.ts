import { Component, input, signal, forwardRef, ChangeDetectionStrategy, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-b-checkbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="flex items-center gap-2 mt-3.5 cursor-pointer"
      [class.opacity-50]="disabled()"
      [class.pointer-events-none]="disabled()"
      (click)="onToggle()"
    >
      <div
        class="custom-checkbox flex items-center justify-center transition-all"
        [class.circle]="shape() === 'circle'"
        [class.square]="shape() === 'square'"
        [class.checked]="value()"
      >
        @if (value() && shape() === 'square') {
          <lucide-angular [img]="CheckIcon" class="w-3.5 h-3.5 text-white"></lucide-angular>
        }
      </div>
      @if (label()) {
        <label class="text-sm font-normal m-0 cursor-pointer text-gray-703">{{ label() }}</label>
      }
    </div>
  `,
  styles: `
    .custom-checkbox {
      width: 22px;
      height: 22px;
      background-color: transparent;
      border: 2px solid #d1d5db;
    }
    .custom-checkbox.circle {
      border-radius: 50%;
    }
    .custom-checkbox.square {
      border-radius: 4px;
    }
    .custom-checkbox.square.checked {
      background-color: var(--color-primary-500);
      border-color: var(--color-primary-500);
    }
    .custom-checkbox.circle.checked {
      background-color: white;
      border-color: var(--color-primary-500);
      background-color: var(--color-primary-500);
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background-color: var(--color-white);
      }
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BCheckboxComponent implements ControlValueAccessor {
  id = input<string>('');
  label = input<string>('');
  shape = input<'circle' | 'square'>('square');

  change = output<boolean>();

  value = signal<boolean>(false);
  disabled = signal<boolean>(false);

  readonly CheckIcon = Check;

  onChange: any = () => {};
  onTouched: any = () => {};

  onToggle() {
    if (this.disabled()) return;
    const newValue = !this.value();
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.change.emit(newValue);
  }

  writeValue(value: any): void {
    this.value.set(!!value);
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
