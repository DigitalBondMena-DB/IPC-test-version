import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormsModule,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { BInputComponent } from '@/shared/components/b-input/b-input.component';
import { BSelectComponent } from '@/shared/components/b-select/b-select.component';
import {
  PreliminaryQuestionsStateService,
  PreliminaryQuestion,
} from '../../preliminary-questions.state';

@Component({
  selector: 'app-preliminary-questions-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    EditorModule,
    SelectModule,
    BInputComponent,
    BSelectComponent,
  ],
  templateUrl: './preliminary-questions-form.component.html',
  styles: [
    `
      :host ::ng-deep .p-editor-container .p-editor-content .ql-editor {
        min-height: 150px;
      }
      :host ::ng-deep .p-editor-toolbar {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
      }
      :host ::ng-deep .p-editor-content {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    `,
  ],
})
export class PreliminaryQuestionsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly stateService = inject(PreliminaryQuestionsStateService);

  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  questionForm!: FormGroup;
  editingId = signal<string | null>(null);

  questionTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Number', value: 'number' },
    { label: 'Phone', value: 'phone' },
    { label: 'Link', value: 'link' },
    { label: 'Dropdown', value: 'dropdown' },
    { label: 'Image', value: 'image' },
    { label: 'Document', value: 'document' },
    { label: 'Video', value: 'video' },
    { label: 'Date', value: 'date' },
    { label: 'DateTime', value: 'datetime' },
    { label: 'True/False', value: 'true_false' },
    { label: 'Radio', value: 'radio' },
    { label: 'File', value: 'file' },
    { label: 'Location', value: 'location' },
    { label: 'Decimal', value: 'decimal' },
    { label: 'Enum List', value: 'enumlist' },
  ];

  showOptions = signal(false);

  constructor() {
    this.initForm();

    effect(() => {
      // Check if we are in route, we don't have to use effect for router params but we can wait for state to load questions
      const id = this.editingId();
      if (id) {
        const question = this.stateService.getQuestionById(id);
        if (question) {
          this.patchFormValues(question);
        }
      }
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('questionId');
      if (id) {
        this.editingId.set(id);
        // It patches in effect waiting for the list to load if it's currently fetching
      }
    });

    this.questionForm.get('type')?.valueChanges.subscribe((type) => {
      this.optionsArray.clear();
      if (['dropdown', 'radio', 'enumlist'].includes(type)) {
        this.showOptions.set(true);
        this.addOption();
      } else {
        this.showOptions.set(false);
      }
    });
  }

  private initForm() {
    this.questionForm = this.fb.group({
      text: ['', Validators.required],
      description: [''],
      hint: [''],
      type: ['text', Validators.required],
      options: this.fb.array([]),
    });
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  addOption() {
    this.optionsArray.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number) {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  isFieldInvalid(name: string) {
    const control = this.questionForm.get(name);
    return control ? control.invalid && control.touched : false;
  }

  isOptionInvalid(index: number) {
    const control = this.optionsArray.at(index);
    return control ? control.invalid && control.touched : false;
  }

  private patchFormValues(question: PreliminaryQuestion) {
    // Avoid double patching loops
    this.questionForm.patchValue({
      text: question.text,
      description: question.description || '',
      hint: question.hint || '',
      type: question.type,
    });

    this.optionsArray.clear();
    if (question.meta_data?.options) {
      question.meta_data.options.forEach((opt: any) => {
        this.optionsArray.push(this.fb.control(opt.label, Validators.required));
      });
      // Important to set showOptions if backend loaded
      this.showOptions.set(true);
    }
  }

  saveQuestion() {
    if (this.addQuestion()) {
      this.goBack();
    }
  }
  addQuestion() {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      console.log(formValue.description);

      const questionData: Omit<PreliminaryQuestion, 'id'> = {
        text: formValue.text,
        type: formValue.type,
        hint: formValue.hint || null,
        description: formValue.description || null,
        meta_data: null,
      };

      if (this.showOptions()) {
        questionData.meta_data = {
          options: formValue.options.map((opt: string) => ({
            label: opt,
            value: opt.toLowerCase().replace(/\s+/g, '_'),
          })),
        };
      }

      const idToEdit = this.editingId();
      if (idToEdit) {
        this.stateService.updateQuestion(idToEdit, questionData);
        this.goBack();
      } else {
        this.stateService.addQuestion(questionData);
        this.questionForm.reset();
      }
      return true;
    } else {
      this.questionForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields correctly',
      });
      return false;
    }
  }

  goBack() {
    // If it was /create, it goes up. If it's /edit/123, it goes up two levels.
    const isEdit = !!this.editingId();
    if (isEdit) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
