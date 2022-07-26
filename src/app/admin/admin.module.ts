import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { LayoutModule } from '../layout/layout.module';

import { AdminComponent } from './admin.component';
import { UsersComponent  } from './components/users/users.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { MonthsComponent } from './components/months/months.component';
import { SubcosComponent } from "./components/subcos/subcos.component";
import { TeamsComponent } from './components/teams/teams.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { AddMonthDialog } from './dialogs/add-month/add-month.dialog';
import { AddProjectDialog } from './dialogs/add-project/add-project.dialog';
import { AddUserDialog } from './dialogs/add-user/add-user.dialog';
import { AddSubcoDialog } from './dialogs/add-subco/add-subco.dialog';
import { AddTeamDialog } from './dialogs/add-team/add-team.dialog';
import { ConfirmMessageDialog } from './dialogs/confirm-message/confirm-message.dialog';

import { FlyingButtonComponent } from '../../stories/FlyingButton/FlyingButton.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatDialogModule,
  ],
  providers: [],
  declarations: [
		AdminComponent,
		UsersComponent,
    ProjectsComponent,
    MonthsComponent,
    TeamsComponent,
    AddProjectDialog,
    AddMonthDialog,
    AddUserDialog,
    AddSubcoDialog,
    AddTeamDialog,
    ConfirmMessageDialog,
    FlyingButtonComponent,
    SubcosComponent
  ],
  exports: [
    MatExpansionModule,
  ],
})
export class AdminModule {}
