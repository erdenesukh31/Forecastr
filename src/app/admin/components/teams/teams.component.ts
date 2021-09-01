import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

import { Subscription } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../../core/interfaces/user';
import { Role } from '../../../core/interfaces/role';
import { environment } from '../../../../environments/environment';
import { TeamService } from '../../../core/services/admin/team.service';
import { Team } from '../../../core/interfaces/team';
import { AddTeamDialog } from '../../dialogs/add-team/add-team.dialog';
import { ConfirmMessageDialog } from '../../dialogs/confirm-message/confirm-message.dialog';

/**
 * project-admin component
 */
@Component({
  selector: 'app-admin-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['../../admin.component.scss', './teams.component.scss'],
})
export class TeamsComponent implements OnInit, OnDestroy {
  /**
   * Sort variable for angular material table sort method
   */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * team list
   */
  teams: Team[];

  /**
   * user list
   */
  user: User[];

  /**
   * teamlead list
   */
  teamleads: User[];

  /**
   * role list
   */
  roles: Role[];

  /**
   * user list subscription
   */
  userSubscription: Subscription;

  /**
   * role list subscription
   */
  roleSubscription: Subscription;

  /**
   * team service constructor
   * @param userService
   */
  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private teamService: TeamService,
  ) {}

  /**
   * Subscribe to user at component init
   */
	ngOnInit(): void {
    this.teamService.initTeams();

    this.teamService.teams$
      .subscribe((teams: Team[]) => {
        this.teams = teams;
        //console.log(teams);
      });

    this.userSubscription = this.userService.allUsers$
      .subscribe((user: User[]) => {
				this.user = user;
				let teamleadIDs: number[] = user.filter((u: User) => u.permission >= environment.roles.pdl).map((u: User) => u.id);
				this.teamleads = user.filter((u: User) => teamleadIDs.indexOf(u.id) >= 0);
      });

    this.roleSubscription = this.userService.roles$
      .subscribe((roles: Role[]) => {
        this.roles = roles;
      });
  }

  addTeam(): void {
    this.showEditDialog(new Team());
  }

  updateTeam(team: Team): void {
    this.showEditDialog(team);
  }

  deleteTeam(team: Team): void {
    let dialogRef: MatDialogRef<ConfirmMessageDialog> = this.dialog.open(ConfirmMessageDialog, {
      data: {
        message: 'Are you sure you want to delete the team "' + team.name + '"?',
        button: { cancel: 'Cancel', submit: 'Delete' },
      },
    });

    dialogRef.afterClosed().subscribe((remove: boolean) => {
      if (remove) {
        this.teamService.deleteTeam(team.teamId);
      }
    });
  }

  /**
   * Remove project subscription when component gets destroyed
   */
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
	}

  /**
   * Returns teammember-list as MatDataTableSource
   * @param parentId
   */
	getTeamMembers(parentId: number): MatTableDataSource<User> {
    let teamlead: User = this.user.find((u: User) => u.id === parentId);
    let team: User[] = this.user.filter((u: User) => u.parentId === parentId);

    team = [...team, ...this.user.filter((u: User) => team.map((us: User) => us.id).indexOf(u.parentId) >= 0)]; // max 2 levels (PDL + PL-level)
    team.unshift(teamlead);

		return new MatTableDataSource(team);
  }
  
  /**
   * returns user role description
   */
  getRole(roleId: number): string | boolean {
    if (this.roles.find((r: Role) => r.roleId === roleId)) {
      return this.roles.find((r: Role) => r.roleId === roleId).name;
    }

    return false;
  }

  /**
   * Opens add/edit team dialog window
   * @param team
   */
  showEditDialog(team: Team): void {
    let dialogRef: any = this.dialog.open(AddTeamDialog, {
      data: {
        team: team,
        user: this.user,
      },
    });

    dialogRef.afterClosed().subscribe((t: Team | boolean) => {
      if (t) {
        this.teamService.setTeam(<Team>t);
      }
    });
  }
}
