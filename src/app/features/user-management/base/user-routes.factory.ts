import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import { Routes, Route } from '@angular/router';
import { BaseUser } from './base-user';

export function createUserRoutes(
  path: string,
  userClass: Type<BaseUser>,
  extraData: any = {},
  canMatch: any[] = [],
): any {
  return {
    path,
    providers: [{ provide: BaseUser, useClass: userClass }],
    ...(canMatch.length ? { canMatch } : {}),
    ...(Object.keys(extraData).length ? { data: extraData } : {}),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/user-management/user-list/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('@features/user-management/user-id/user-id.component').then(
            (m) => m.UserIdComponent,
          ),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import('@features/user-management/user-id/user-id.component').then(
            (m) => m.UserIdComponent,
          ),
      },
    ],
  };
}
