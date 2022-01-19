import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from './core/security/role-guard.service';

import { LoginComponent } from './login/login.component';
import { ForecastComponent } from './forecast/forecast.component';
import { AdminComponent } from './admin/admin.component';

import { IndividualComponent } from './forecast/pages/individual/individual.component';
import { TeamComponent } from './forecast/pages/team/team.component';

// Currently (June 2019) not possible to use ENV variable in routing module because compodoc doc-generation would fail otherwise
import { environment as env } from '../environments/environment';
import { PracticeComponent } from './forecast/pages/practice/practice.component';
import { ExecutiveComponent } from './forecast/pages/executive/executive.component';
import { SubcosComponent } from './forecast/pages/subcos/subcos.component'
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { StaffingComponent } from './forecast/pages/staffing/staffing.component';
import { HeadOfPracticesComponent } from './forecast/pages/head-of-practices/head-of-practices.component';
import { PracticesComponent } from './forecast/pages/practices/practices.component';
import { CanActivate } from '@angular/router';
import { FinancialControllerComponent } from './forecast/pages/financial-controller/financial-controller.component';
import { SubcosExecutiveComponent } from './forecast/pages/subcos-executive/subcos-executive.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent,
  },
  {
    path: 'admin', // env.routes.admin
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: 100, // env.roles.admin,
    },
  },
  {
    path: 'forecast',
    component: ForecastComponent,
    canActivate: [RoleGuard],
    data: {
      expectedRole: 0, // env.roles.css,
    },
    children: [
      {
        path: 'individual/:id',
        component: IndividualComponent,
      },
      {
        path: 'team/:id',
        component: TeamComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 1, // env.roles.pdl,
        },
      },
      {
        path: 'practice/:id',
        component: PracticeComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 2, // env.roles.pl,
        },
      },
      {
        path: 'executive/:id',
        component: ExecutiveComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 3, // env.roles.msl,
        },
      },
      {
        path: 'executive-detail/:id',
        component: ExecutiveComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 3, // env.roles.msl,
        },
      },
      {
        path: 'staffing/:id',
        component: StaffingComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole : 3, //env.roles.sm,
        },
      },
      {
        path: "head-of-practices/:id",
        component: HeadOfPracticesComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 3, //env.roles.hop
        },
      },
      {
        path: "practices/:id",
        component: PracticesComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 3, //env.roles.hop | sm
        },
      },
      {
        path: "financial-controller/:id",
        component: FinancialControllerComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 4, //env.roles.fc
        },
      },
      {
        path: "subcos/:id",
        component: SubcosComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole:  0, // env.roles.css,
        },
      },
      {
        path: "subcos-executive/:id",
        component: SubcosExecutiveComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: 4, //env.roles.fc
        },
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
