import { NavItem } from './nav-item.model';

export interface SidebarFooterConfig {
  title: string;
  buttons: { label: string; routerLink: string }[];
}

export const ALL_MENU_ITEMS: NavItem[] = [
  { label: 'User Management', icon: 'Dashboard', isSection: true },
  { label: 'Overview', routerLink: '/dashboard' },
  { label: 'Divisions', roles: ['super_admin', 'authority'], routerLink: '/dashboard/divisions' },
  { label: 'Authority', routerLink: '/dashboard/authorities', roles: ['super_admin'] },
  {
    label: 'Governorates',
    roles: ['super_admin', 'authority'],
    routerLink: '/dashboard/governorates',
  },
  { label: 'Sectors', roles: ['super_admin', 'authority'], routerLink: '/dashboard/sectors' },
  { label: 'Facilities', routerLink: '/dashboard/facilities', roles: ['super_admin', 'authority'] },
  {
    label: 'User Management',
    expanded: false,
    children: [
      { label: 'Super Admin', roles: ['super_admin'], routerLink: '/dashboard/super-admin-users' },
      {
        label: 'Authority',
        roles: ['super_admin', 'authority'],
        routerLink: '/dashboard/authorities-users',
      },
      {
        label: 'Sectors',
        roles: ['super_admin', 'governorate', 'authority'],
        routerLink: '/dashboard/sectors-users',
      },
      {
        label: 'Governorates',
        roles: ['super_admin', 'governorate', 'authority'],
        routerLink: '/dashboard/governorates-users',
      },

      {
        label: 'Facilities',
        roles: ['super_admin', 'authority', 'authority'],
        routerLink: '/dashboard/facilities-users',
      },
    ],
  },

  { label: 'Survey Builder', roles: ['super_admin'], icon: 'Survey', isSection: true },
  {
    label: 'New Survey',
    roles: ['super_admin'],
    icon: 'Plus',
    routerLink: '/survey/create/setup',
    isButton: true,
  },
  { label: 'Surveys', roles: ['super_admin'], routerLink: '/survey' },
  {
    label: 'Conditional logic',
    roles: ['super_admin'],
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
