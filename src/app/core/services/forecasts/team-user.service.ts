import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from "../../interfaces/user";
import { HttpClient } from "@angular/common/http";
import { BusinessOperationsService } from "../../shared/business-operations.service";
import { UserService } from "../user.service";
import { AuthService } from "../../security/auth.service";
import { environment as env } from '../../../../environments/environment';
import { Team } from "../../interfaces/team";

/**
 * team service for PDL (team) + PL (practice)
 */
@Injectable({
  providedIn: "root",
})
export class TeamUserService {
  /**
   * pdl team array
   */
  teamPDL$: BehaviorSubject<User[]>;

  /**
   * pl team array
   */
  teamPL$: BehaviorSubject<User[]>;

  prTeams$: BehaviorSubject<Team[]>;

  practices: Map<number, User[]>;

  /**
   * default constructor for teamservice
   * @param http
   * @param BO
   * @param userService
   */
  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
    private userService: UserService,
    private authService: AuthService,
    ) {
    this.teamPDL$ = new BehaviorSubject([]);
    this.teamPL$ = new BehaviorSubject([]);
    this.prTeams$ = new BehaviorSubject([]);
  }

  initializeTeams(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.getTeams()).subscribe((ts: Team[]) => {
        this.prTeams$.next(ts);
      })
      resolve();
    })
  }

  getPrTeams(): Team[] {
    return this.prTeams$.getValue();
  }

  /**
   * Requests PDL-team data from server
   */
  initializePDLTeam(): void {
    this.http.get<User[]>(this.BO.getTeam(1))
      .subscribe((user: User[]) => {
        this.teamPDL$.next(user.sort((a, b) => (a.lastName > b.lastName) ? 1 : -1));
        this.userService.addUsers(user);
      });
  }

  /**
   * Request PL-team data from server
   */
  initializePLTeam(): void {
    if(this.authService.hasRole(env.roles.msl)) {
      this.http.get<User[]>(this.BO.getTeam(3)).subscribe((user: User[]) => {
        let ts = this.getPrTeams().filter((t: Team) => t.teamLeadId !== this.authService.getUserId());
        let tsUsers: number[] = [];

        ts.forEach((t: Team) => {
          let childs = [t.teamLeadId];
          childs = [...childs, ...user.filter((u: User) => u.parentId === t.teamLeadId).map((u: User) => u.id)];
          let tUsers = [...childs, ...user.filter((u: User) => childs.indexOf(u.parentId) >= 0).map((u: User) => u.id)];
          tsUsers = tsUsers.concat(tUsers);
        });

        let users = user.filter((u: User) => tsUsers.findIndex((tU: number) => tU === u.id) === -1);

        this.teamPL$.next(users.sort((a, b) => (a.lastName > b.lastName ? 1 : -1)));
        this.userService.addUsers(users);
      });
    } else {
      this.http.get<User[]>(this.BO.getTeam(2)).subscribe((user: User[]) => {
        this.teamPL$.next(user.sort((a, b) => (a.lastName > b.lastName ? 1 : -1)));
        this.userService.addUsers(user);
      });
    }
  }

  /**
   * Returns childs
   * if level > 1: also returns childs of childs
   * @param level
   * @param parentId
   */
  getTeamChilds(level: number, parentId: number): number[] {
    let childs: number[] = [parentId];

    if (level === 2) {
      childs = [...childs, ...this.teamPL$.getValue().filter((u: User) => u.parentId === parentId).map((u: User) => u.id)];
      return [...childs, ...this.teamPL$.getValue().filter((u: User) => childs.indexOf(u.parentId) >= 0).map((u: User) => u.id)];
    }

    return [...childs, ...this.teamPDL$.getValue().filter((u: User) => u.parentId === parentId).map((u: User) => u.id)];
  }

  /**
   * Resets team data
   */
  reset(): void {
    this.teamPDL$.next([]);
    this.teamPL$.next([]);
  }
}
