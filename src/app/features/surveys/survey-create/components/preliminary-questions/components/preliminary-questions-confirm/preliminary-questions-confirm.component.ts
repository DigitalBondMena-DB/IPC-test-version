import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-preliminary-questions-confirm',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './preliminary-questions-confirm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreliminaryQuestionsConfirmComponent {
  questions = input.required<any[]>();

  editClick = output<number>();
  removeClick = output<number>();

  readonly trashIcon = Trash2;
  readonly editIcon = Pencil;
}
