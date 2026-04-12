import { Role } from '@/shared/models/users-role.model';

export interface ILoginData {
  identity: string;
  password: string;
  remember_me: boolean;
}
export interface ILoginResponse {
  token: string;
  user: IUser;
}
export interface IUser {
  id: string;
  name: string;
  email: string;
  entity_type: string;
  is_supervisor: boolean;
  role: Role;
  has_full_access: boolean;
  entity_id?: string;
  entity?: any;
}
