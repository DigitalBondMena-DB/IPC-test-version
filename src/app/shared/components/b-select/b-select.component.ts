import {
  Component,
  input,
  signal,
  forwardRef,
  ChangeDetectionStrategy,
  output,
  OnDestroy,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BLableComponent } from '../b-lable/b-lable.component';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-b-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SelectModule,
    BLableComponent,
    TooltipModule,
  ],
  templateUrl: './b-select.component.html',
  styleUrl: './b-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BSelectComponent implements ControlValueAccessor, OnDestroy {
  id = input<string>('');
  label = input<string>('');
  subLable = input<string>('');
  placeholder = input<string>('');
  options = input<any[]>([]);
  filter = input<boolean>(false);
  virtualScroll = input<boolean>(false);
  loading = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string | null>(null);
  disabledTooltip = input<string>('');
  // Outputs
  onSearch = output<string>();
  onScrollPagination = output<any>();

  value = signal<any>(null);
  disabled = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe((text) => this.onSearch.emit(text));

  onChange: any = () => {};
  onTouched: any = () => {};

  onSelectChange(event: any) {
    const val = event.value;
    this.value.set(val);
    this.onChange(val);
  }

  onModelChange(val: any) {
    this.value.set(val);
    this.onChange(val);
  }

  onFilterChange(event: any) {
    this.searchSubject.next(event.filter);
  }

  writeValue(value: any): void {
    this.value.set(value || null);
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

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
