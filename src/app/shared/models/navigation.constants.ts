import { NavItem } from './nav-item.model';

export interface SidebarFooterConfig {
  title: string;
  buttons: { label: string; routerLink: string }[];
}

export const ALL_MENU_ITEMS: NavItem[] = [
  { label: 'User Management', icon: 'Dashboard', isSection: true },
  { label: 'Overview', routerLink: '/dashboard' },
  { label: 'Divisions', roles: ['ministry'], routerLink: '/dashboard/divisions' },
  { label: 'Governorates', roles: ['ministry'], routerLink: '/dashboard/governorates' },
  { label: 'Sectors', roles: ['ministry'], routerLink: '/dashboard/sectors' },
  { label: 'Authority', routerLink: '/dashboard/authorities' },
  { label: 'Facilities', routerLink: '/dashboard/facilities' },
  {
    label: 'User Management',
    expanded: false,
    children: [
      { label: 'Super Admin', roles: ['ministry'], routerLink: '/dashboard/super-admin-users' },
      {
        label: 'Authority',
        roles: ['ministry', 'authority', 'authority_hospital'],
        routerLink: '/dashboard/authorities-users',
      },
      {
        label: 'Governorates',
        roles: ['ministry', 'governorate'],
        routerLink: '/dashboard/governorates-users',
      },
      {
        label: 'Sectors',
        roles: ['ministry', 'governorate', 'medical_area'],
        routerLink: '/dashboard/sectors-users',
      },

      {
        label: 'Facilities',
        roles: ['ministry', 'authority_hospital'],
        routerLink: '/dashboard/facilities-users',
      },
    ],
  },

  { label: 'Survey Builder', roles: ['ministry'], icon: 'Survey', isSection: true },
  {
    label: 'New Survey',
    roles: ['ministry'],
    icon: 'Plus',
    routerLink: '/survey/create/setup',
    isButton: true,
  },
  { label: 'Surveys', roles: ['ministry'], routerLink: '/survey' },
  {
    label: 'Conditional logic',
    roles: ['ministry'],
    routerLink: '/survey/conditional-logic/review',
  },

  // { label: 'Reports', icon: 'Reports', isSection: true },
  // { label: 'Overview', routerLink: '/reports/overview' },
  // { label: 'Survey Level', routerLink: '/reports/survey-level' },
  // { label: 'Entity Level', routerLink: '/reports/entity-level' },
  // { label: 'Visit Results', routerLink: '/reports/visit-results' },
  // { label: 'Surveyor Results', routerLink: '/reports/surveyor-results' },
  // { label: 'Action Plan', routerLink: '/reports/action-plan' },
  // { label: 'Filter', routerLink: '/reports/filter' },
];

export const MAIN_MENU_ITEMS: NavItem[] = ALL_MENU_ITEMS;
export const SURVEY_MENU_ITEMS: NavItem[] = ALL_MENU_ITEMS;
