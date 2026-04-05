import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '@/core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { ALL_MENU_ITEMS } from '@/shared/models/navigation.constants';
import { LucideAngularModule, ChevronsRight } from 'lucide-angular';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-top-bar-breadcrumb',
  imports: [LucideAngularModule, Tooltip],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarBreadcrumbComponent {
  private readonly _AuthService = inject(AuthService);
  private readonly router = inject(Router);
  ChevronsRight = ChevronsRight;
  username = computed(() => this._AuthService.userData()?.user.name);

  activeBreadcrumb = signal<{ section: string; parent: string; item: string } | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event: any) => {
        this.updateBreadcrumb(event.urlAfterRedirects);
      });

    // Initial calculation
    this.updateBreadcrumb(this.router.url);
  }

  private updateBreadcrumb(url: string) {
    let currentSection = '';
    let foundSection = '';
    let foundParent = '';
    let foundItem = '';
    let longestMatch = '';

    const checkMatch = (link: string | undefined, label: string, parentLabel: string = '') => {
      if (link && url.includes(link) && link.length > longestMatch.length) {
        longestMatch = link;
        foundSection = currentSection;
        foundParent = parentLabel;
        foundItem = label;
      }
    };

    for (const item of ALL_MENU_ITEMS) {
      if (item.isSection) {
        currentSection = item.label;
      }

      if (item.children) {
        for (const child of item.children) {
          checkMatch(child.routerLink, child.label, item.label);
        }
      } else {
        checkMatch(item.routerLink, item.label);
      }
    }

    if (foundItem) {
      this.activeBreadcrumb.set({ section: foundSection, parent: foundParent, item: foundItem });
    } else {
      this.activeBreadcrumb.set(null);
    }
  }
}
