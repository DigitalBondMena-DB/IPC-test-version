import { Injectable, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { MessageService } from 'primeng/api';

export interface PreliminaryQuestion {
  id?: string; // local temporary ID
  text: string;
  type: string;
  hint?: string | null;
  description?: string | null;
  meta_data?: any;
}

@Injectable()
export class PreliminaryQuestionsStateService {
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly messageService = inject(MessageService);

  readonly surveyId = signal<string | null>(null);
  readonly questionsList = signal<PreliminaryQuestion[]>([]);
  readonly isSubmitting = signal(false);

  private readonly surveyResource = this.surveyService.getSurveyById(this.surveyId);

  constructor() {
    // Find the survey ID from parent routes
    let currentRoute: ActivatedRoute | null = this.route;
    let foundId = null;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('id');
      if (id) {
        foundId = id;
        break;
      }
      currentRoute = currentRoute.parent;
    }

    if (foundId) {
      this.surveyId.set(foundId);
    }

    effect(
      () => {
        const data = this.surveyResource.value();
        if (data && data.preliminary_questions) {
          // Map data to include local IDs if missing, so we can track them
          const mappedQuestions = data.preliminary_questions.map((q: any) => ({
            ...q,
            id: q.id || crypto.randomUUID(),
          }));
          this.questionsList.set(mappedQuestions);
        }
      },
      { allowSignalWrites: true },
    );
  }

  syncWithBackend(successMessage: string) {
    if (!this.surveyId()) return;

    // Strip temp IDs before sending to backend if backend complains,
    // but usually it's fine. We will omit it just in case:
    const payload = {
      preliminary_questions: this.questionsList().map((q) => {
        const { id, ...rest } = q;
        return rest;
      }),
    };

    this.surveyService.updateSurvey(this.surveyId()!, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: successMessage,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to save to backend',
        });
      },
    });
  }

  addQuestion(question: Omit<PreliminaryQuestion, 'id'>) {
    const newQuestion = { ...question, id: crypto.randomUUID() };
    this.questionsList.update((list) => [...list, newQuestion]);
    this.syncWithBackend('Question added successfully');
  }

  updateQuestion(id: string, updatedData: Omit<PreliminaryQuestion, 'id'>) {
    this.questionsList.update((list) => list.map((q) => (q.id == id ? { ...updatedData, id } : q)));
    console.log(this.questionsList());

    this.syncWithBackend('Question updated successfully');
  }

  removeQuestion(id: string) {
    this.questionsList.update((list) => list.filter((q) => q.id !== id));
    this.syncWithBackend('Question deleted successfully');
  }

  getQuestionById(id: string): PreliminaryQuestion | undefined {
    console.log(this.questionsList());
    console.log(this.questionsList().find((q) => q.id == id));

    return this.questionsList().find((q) => q.id == id);
  }

  async submitToNextStep(): Promise<boolean> {
    if (!this.surveyId()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Survey ID not found',
      });
      return false;
    }

    this.isSubmitting.set(true);

    // We construct the payload, omitting local 'id'
    const payload = {
      preliminary_questions: this.questionsList().map((q) => {
        const { id, ...rest } = q;
        return rest;
      }),
    };

    return new Promise((resolve) => {
      this.surveyService.updateSurvey(this.surveyId()!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Preliminary questions saved',
          });
          this.isSubmitting.set(false);
          resolve(true);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'Failed to save',
          });
          resolve(false);
        },
      });
    });
  }
}
