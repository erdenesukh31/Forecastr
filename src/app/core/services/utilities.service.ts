import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { Project } from '../interfaces/project';
import { Month } from '../interfaces/month';
import { Probability } from '../interfaces/probability';
import { Team } from '../interfaces/team';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { HierarchyNode } from '../interfaces/hierarchyNode';

/**
 * utilities services (for months + projects + probabilities)
 */
@Injectable({
  providedIn: 'root',
})
export class UtilitiesService {
  /**
   * Observable which contains all months which are shown in the application
   */
  months$: BehaviorSubject<Month[]>;

  /**
   * Observable which contains all projects
   */
  projects$: BehaviorSubject<Project[]>;

  /**
   * Observable which contains all probability types
   */
  probabilities$: BehaviorSubject<Probability[]>;

  /**
   * Observable which contains all teams
   */
  teams$: BehaviorSubject<Team[]>;

  /**
   * Observable which contains the hirarchy
   */
  hierarchy$: BehaviorSubject<HierarchyNode>;



  /**
   * utilities service constructor
    * @param http
    * @param BO
    */
   constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
  ) {
    this.months$ = new BehaviorSubject([]);
    this.projects$ = new BehaviorSubject([]);
    this.probabilities$ = new BehaviorSubject([]);
    this.hierarchy$ = new BehaviorSubject(null);
    this.teams$ = new BehaviorSubject([]);
  }

  initMonths(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.getUtilMonths()).subscribe((months: Month[]) => {
        this.months$.next(months);
        resolve();
      }, () => reject());
    });
  }

  initTeams(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.getTeams()).subscribe((teams: Team[]) => {
        this.teams$.next(teams);
        resolve();
      }, () => reject());
    });
  }

  initProjects(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.getUtilProjects()).subscribe((projects: Project[]) => {
        this.projects$.next(projects.sort((a, b) => (b.mandatory === 'Y') ? 1 : -1));
        resolve();
      }, () => reject());
    });
  }

  initProbabilities(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.getProbabilities()).subscribe((probabilities: Probability[]) => {
        this.probabilities$.next(probabilities);
        resolve();
      }, () => reject());
    });
  }

  initHirarchy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get(this.BO.companyHierarchy()).subscribe((hierarchy: HierarchyNode) => {
        this.hierarchy$.next(hierarchy);
        resolve();
      }, () => reject());
    });
  }

  addProject(project: Project): void {
    let projects: Project[] = this.projects$.getValue();
    projects.push(project);
    this.projects$.next(projects);
  }

  addTeam(team: Team): void {
    let teams: Team[] = this.teams$.getValue();
    teams.push(team);
    this.teams$.next(teams);
  }

  /**
   * Empties utility-data
   * Typically called at logout
   */
  reset(): void {
    this.months$.next([]);
    this.projects$.next([]);
    this.probabilities$.next([]);
    this.teams$.next([]);
  }

  /**
   * returns all months
   */
  getMonths(): Month[] {
    return this.months$.getValue();
  }

  /**
   * returns all projects
   */
  getProjects(): Project[] {
    return this.projects$.getValue();
  }

  /**
   * returns all probabilities
   */
  getProbabilities(): Probability[] {
    return this.probabilities$.getValue();
  }

    /**
   * returns all probabilities
   */
    getSubcoProbabilities(): Probability[] {
      return this.probabilities$.getValue().filter(p => p.name != 'Unnamed');
    }

  /**
   * returns all teams
   */
  getTeams(): Team[] {
    return this.teams$.getValue();
  }
}
