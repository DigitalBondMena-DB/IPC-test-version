import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { LucideAngularModule, GitFork, Plus } from 'lucide-angular';
import { ConditionalLogicStateService } from './conditional-logic.state';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-conditional-logic',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, ReactiveFormsModule],
  templateUrl: './conditional-logic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConditionalLogicStateService],
})
export class ConditionalLogicComponent implements OnInit {
  private readonly state = inject(ConditionalLogicStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly GitForkIcon = GitFork;
  readonly PlusIcon = Plus;
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
  );
  readonly isReviewPage = computed(() => {
    return this.currentUrl()?.includes('/review');
  });

  constructor() {
    let currentRoute: ActivatedRoute | null = this.route;
    let id: string | null = null;
    while (currentRoute && !id) {
      id = currentRoute.snapshot.paramMap.get('id');
      currentRoute = currentRoute.parent;
    }

    if (id) {
      this.state.setSurveyId(id);
    }

    effect(() => {
      const data = this.state.surveyResource?.value();
      if (data) {
        this.state.processSurveyData(data);
      }
    });
  }

  onAddLogic() {
    this.router.navigate(['./form'], { relativeTo: this.route });
  }

  ngOnInit() {}
}
