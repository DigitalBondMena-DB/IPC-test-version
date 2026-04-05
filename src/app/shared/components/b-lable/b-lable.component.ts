import { Component, input } from '@angular/core';

@Component({
  selector: 'app-b-lable',
  imports: [],
  templateUrl: './b-lable.component.html',
  styleUrl: './b-lable.component.css',
})
export class BLableComponent {
  id = input<string>('');
  label = input<string>('');
  subLable = input<string>('');
}
