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
}
