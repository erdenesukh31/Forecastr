import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BusinessOperationsService } from "../../shared/business-operations.service";
import { UserService } from "../user.service";
import { Team } from "../../interfaces/team";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageStateService } from "../../shared/page-state.service";

/**
 * team service
 */
@Injectable({
  providedIn: "root",
})
export class TeamService {
  /**
   * team array
   */
  teams$: BehaviorSubject<any>;

  /**
   * default constructor for teamservice
   * @param http
   * @param BO
   * @param userService
   */
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private BO: BusinessOperationsService,
    private userService: UserService,
    private pageState: PageStateService,
    ) {
    this.teams$ = new BehaviorSubject([]);
  }

  initTeams(): void {
    this.http.get(this.BO.getTeams()).subscribe((teams: Team[]) => {
      this.teams$.next(teams);
    });
  }

  setTeam(team: Team): void {
    this.pageState.showSpinner();

    if (typeof team.teamId !== 'number') {
      this.http.put(this.BO.setTeam(), team)
        .subscribe((t: Team) => {
          let teams: Team[] = this.teams$.getValue();
          teams.push(t);
          this.teams$.next(teams);

          this.snackBar.open('Team successfully added!', 'OK', { duration: 5000, });
          this.pageState.hideSpinner();

        }, (e: any) => {
          this.snackBar.open('Team could not be added!', 'OK', { duration: 10000, });
          this.pageState.hideSpinner();

        });
    } else {
      this.http.put(this.BO.setTeam(), team)
        .subscribe((t: Team) => {
          let teams: Team[] = this.teams$.getValue();
          teams
            .filter((te: Team) => te.teamId === t.teamId)
            .forEach((te: Team) => {
              te.name = t.name;
              te.teamLeadId = t.teamLeadId;
            });
          this.teams$.next(teams);

          this.snackBar.open('Team successfully saved!', 'OK', { duration: 5000, });
          this.pageState.hideSpinner();

        }, (e: any) => {
          this.snackBar.open('Team could not be saved!', 'OK', { duration: 10000, });
          this.pageState.hideSpinner();

        });
    }
  }

  deleteTeam(teamId: number): void {
    this.http.delete(this.BO.deleteTeam(teamId))
      .subscribe(() => {
        let teams: Team[] = this.teams$.getValue();
        this.teams$.next(teams.filter((te: Team) => te.teamId !== teamId));

        this.snackBar.open('Team successfully deleted!', 'OK', { duration: 5000, });
        this.pageState.hideSpinner();

      }, (e: any) => {
        this.snackBar.open('Team could not be deleted!', 'OK', { duration: 10000, });
        this.pageState.hideSpinner();

      });
  }

  /**
   * Resets team data
   */
  reset(): void {
    this.teams$.next([]);
  }
}
