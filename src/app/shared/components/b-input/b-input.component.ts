import { Component, input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { BLableComponent } from '../b-lable/b-lable.component';

@Component({
  selector: 'app-b-input',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, BLableComponent],
  templateUrl: './b-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BInputComponent implements ControlValueAccessor {
  id = input<string>('');
  subLable = input<string>('');
  class = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'password' | 'email' | 'number'>('text');
  icon = input<any>();
  eyeIcon = input<any>(Eye);
  eyeOffIcon = input<any>(EyeOff);
  errorMessage = input<string | null>(null);

  value = signal<string>('');
  disabled = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  hasError = input<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  inputType() {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur() {
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value.set(value || '');
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
