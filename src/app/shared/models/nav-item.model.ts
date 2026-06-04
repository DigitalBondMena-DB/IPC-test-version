import { Role } from './users-role.model';

export interface NavItem {
  label: string;
  icon?: string;
  routerLink?: string;
  children?: NavItem[];
  expanded?: boolean;
  isSection?: boolean;
  isButton?: boolean;
  roles?: Role[];
  requireSupervisor?: boolean;
}
export interface NavItemWithChildren {
  lable: string;
  icon: string;
  children: NavItem[];
  roles?: Role[];
  requireSupervisor?: boolean;
}
