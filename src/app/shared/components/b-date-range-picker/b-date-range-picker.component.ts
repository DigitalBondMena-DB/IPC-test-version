import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CalendarDays } from 'lucide-angular';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgxDaterangepickerMd, LocaleService, LOCALE_CONFIG } from 'ngx-daterangepicker-material';
import moment from 'moment';

@Component({
  selector: 'app-b-date-range-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, NgxDaterangepickerMd],
  templateUrl: './b-date-range-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: LOCALE_CONFIG, useValue: {} },
    { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG] },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BDateRangePickerComponent),
      multi: true,
    },
  ],
})
export class BDateRangePickerComponent implements ControlValueAccessor {
  placeholder = input<string>('Select Date Range');
  opens = input<'left' | 'center' | 'right'>('right'); // default right for alignment
  drops = input<'up' | 'down'>('down');

  readonly calendarIcon = CalendarDays;

  selectedRange = signal<any>(null);
  isDateDropdownOpen = signal<boolean>(false);
  
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'Last 6 Months': [moment().subtract(6, 'month'), moment()],
    Lifetime: [moment('2020-01-01'), moment()],
  };

  rangeToNameMap: Record<string, string> = {
    Today: 'today',
    Yesterday: 'yesterday',
    'Last 7 Days': 'last_7_days',
    'Last 30 Days': 'last_30_days',
    'Last 6 Months': 'last_6_months',
    Lifetime: 'lifetime',
  };

  disabled = false;
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(obj: any): void {
    if (obj) {
      if (obj.from && obj.to) {
        this.selectedRange.set({
          startDate: moment(obj.from),
          endDate: moment(obj.to),
          chosenLabel: obj.range || 'Custom Range'
        });
      }
    } else {
      this.selectedRange.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDateDropdown() {
    if (!this.disabled) {
      this.isDateDropdownOpen.update((value) => !value);
    }
  }

  onDatesUpdated(event: any) {
    this.selectedRange.set(event);
  }

  applyFilter() {
    const range = this.selectedRange();
    let value = null;
    if (range && range.startDate && range.endDate) {
      value = {
        from: range.startDate.format('YYYY-MM-DD'),
        to: range.endDate.format('YYYY-MM-DD'),
        range: this.rangeToNameMap[range.label] || '',
      };
    }
    
    this.onChange(value);
    this.onTouch();
    this.isDateDropdownOpen.set(false);
  }

  clearFilter() {
    this.selectedRange.set(null);
    this.onChange(null);
    this.onTouch();
    this.isDateDropdownOpen.set(false);
  }
}
