import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  ChevronUp,
  LayoutGrid,
  Pencil,
} from 'lucide-angular';
import { SurveyStructureStateService } from '../../survey-structure.state';

@Component({
  selector: 'app-structure-tree',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    TooltipModule,
  ],
  templateUrl: './structure-tree.component.html',
  styleUrl: '../../survey-structure.component.css'
})
export class StructureTreeComponent {
  readonly state = inject(SurveyStructureStateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly chevronUpIcon = ChevronUp;
  readonly domainIcon = LayoutGrid;
  readonly pencilIcon = Pencil;

  get domains() {
    return this.state.domains;
  }

  isLoaded = this.state.isLoaded;
  weightingType = this.state.weightingType;
  isStructureValid = this.state.isStructureValid;

  addDomain() {
    this.state.addDomain();
  }

  removeDomain(index: number) {
    this.state.removeDomain(index);
  }

  toggleNode(node: FormGroup) {
    this.state.toggleNode(node);
  }

  getSubdomains(node: FormGroup) {
    return this.state.getSubdomains(node);
  }

  getQuestions(node: FormGroup) {
    return this.state.getQuestions(node);
  }

  addSubdomain(node: FormGroup) {
    this.state.addSubdomain(node);
  }

  removeSubdomain(parent: FormGroup, index: number) {
    this.state.removeSubdomain(parent, index);
  }

  onNodeBlur(node: FormGroup) {
    this.state.onNodeBlur(node);
  }

  syncDomains() {
    this.state.syncDomains();
  }

  canAddSubdomain(node: FormGroup): boolean {
    return this.state.canAddSubdomain(node);
  }

  canAddQuestion(node: FormGroup): boolean {
    return this.state.canAddQuestion(node);
  }

  prepareAddQuestion(node: FormGroup, breadcrumbs: string[]) {
    this.state.prepareAddQuestion(node, breadcrumbs);
    this.router.navigate(['../graded'], { relativeTo: this.route, queryParams: { from: 'tree' } });
  }

  prepareEditQuestion(node: FormGroup, breadcrumbs: string[], editIndex: number) {
    this.state.prepareEditQuestion(node, breadcrumbs, editIndex);
    this.router.navigate(['../graded'], { relativeTo: this.route, queryParams: { from: 'tree' } });
  }

  goToConfirmation() {
    if (this.isStructureValid()) {
      this.router.navigate(['../graded-review'], { relativeTo: this.route });
    }
  }

  createBadge(level: number, index: number, pathIds: number[] = []): string {
    if (level === 0) return `D${index + 1}`;
    let badge = `D${(pathIds[0] !== undefined ? pathIds[0] : 0) + 1}`;
    if (level >= 1) {
      const sIndex = level === 1 ? index : pathIds[1];
      badge += `-S${(sIndex !== undefined ? sIndex : 0) + 1}`;
    }
    if (level >= 2) {
      for (let i = 2; i < level; i++) {
        badge += `-${(pathIds[i] !== undefined ? pathIds[i] : 0) + 1}`;
      }
      badge += `-${index + 1}`;
    }
    return badge;
  }
}
