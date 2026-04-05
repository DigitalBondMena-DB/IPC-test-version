import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { HomeService } from '../services/home.service';
import { IHomeResponse } from '../interfaces/home';
import { HttpResourceRef } from '@angular/common/http';
import { HomeSkeletonComponent } from '../components/home-skeleton/home-skeleton.component';
import { TopBarBreadcrumbComponent } from '@/core/layout/main-layout/components/top-bar/top-bar.component';
import { BPageHeaderComponent } from "@/shared/components/b-page-header/b-page-header.component";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeSkeletonComponent, TopBarBreadcrumbComponent, BPageHeaderComponent],
})
export class HomePageComponent {
  private homeService = inject(HomeService);
  private homeResponse: HttpResourceRef<IHomeResponse | undefined> = this.homeService.getHomeData();

  counts = computed(() => this.homeResponse.value()?.data.counts);
  reportCards = computed(() => [
    {
      title: 'Total Users',
      value: this.counts()?.users,
      image: {
        src: '/assets/images/home/total-user.png',
        width: 133,
        height: 107,
      },
    },
    {
      title: 'Total Surveys',
      value: this.counts()?.surveys,
      image: {
        src: '/assets/images/home/total-surveys.png',
        width: 133,
        height: 107,
      },
    },
    {
      title: 'Total Divisions',
      value: this.counts()?.categories,
      image: {
        src: '/assets/images/home/total-divisions.png',
        width: 153,
        height: 105,
      },
    },
    {
      title: 'Health Directorates',
      value: this.counts()?.governorates,
      image: {
        src: '/assets/images/home/health-directorates.png',
        width: 126,
        height: 118,
      },
    },

    {
      title: 'Total Health Organizations',
      value: this.counts()?.medical_areas,
      image: {
        src: '/assets/images/home/total-health-org.png',
        width: 91,
        height: 90,
      },
    },
    {
      title: 'Total Hospitals',
      value: this.counts()?.hospitals,
      image: {
        src: '/assets/images/home/total-hospitals.png',
        width: 139,
        height: 84,
      },
    },
  ]);
  isLoading = computed(() => this.homeResponse.isLoading());
}
