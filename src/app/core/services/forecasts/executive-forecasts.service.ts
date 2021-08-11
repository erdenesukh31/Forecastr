import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BusinessOperationsService } from "../../shared/business-operations.service";
import { BehaviorSubject, Observable } from "rxjs";
import { UtilitiesService } from "../utilities.service";
import { Month } from "../../interfaces/month";
import { ForecastService } from "./forecast.service";
import { FcEntry } from "../../interfaces/fcEntry";
import { User } from "../../interfaces/user";
import { FcProject } from "../../interfaces/fcProject";
import { Project } from "../../interfaces/project";
import { environment } from "../../../../environments/environment";
import { Team } from "../../interfaces/team";
import { MonthlySummaryReport } from "../../interfaces/kpiData";
import { GraphicSummaryReport } from "../../interfaces/graphicData";
import { HierarchyNode } from "../../interfaces/hierarchyNode";
import { FinancialControllerSummaryAPPS } from "../../interfaces/financialAppsSummary";
import { PageStateService } from '../../shared/page-state.service';
import { reject } from "q";
/**
 * executive service
 */
@Injectable({
  providedIn: "root",
})
export class ExecutiveForecastsService {
  summaryValues$: BehaviorSubject<SummaryValues[]>;
  monthValues$: BehaviorSubject<SummaryValues[]>;
  kpiData$: BehaviorSubject<MonthlySummaryReport[]>;
  graphicData$: BehaviorSubject<GraphicSummaryReport[]>;
  hierarchy$: BehaviorSubject<HierarchyNode>;
  financialData$: BehaviorSubject<FinancialControllerSummaryAPPS[]>;

  monthId: number = 1;
  months: Month[];
  projects: Project[];
  teams: Team[];

  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
    private us: UtilitiesService,
    private pageState: PageStateService,
    private forecastService: ForecastService,
    private utilitiesService: UtilitiesService
  ) {
    this.summaryValues$ = new BehaviorSubject([]);
    this.monthValues$ = new BehaviorSubject([]);
    this.kpiData$ = new BehaviorSubject([]);
    this.graphicData$ = new BehaviorSubject([]);
    this.financialData$ = new BehaviorSubject([]);

    this.initProjects();
    this.initTeams();
    this.initHierarchy();
  }

  initProjects(): void {
    this.utilitiesService.projects$.subscribe((projects: Project[]) => {
      this.projects = projects;
    });
  }

  initTeams(): void {
    this.utilitiesService.teams$.subscribe((teams: Team[]) => {
      this.teams = teams;
    });
  }

  initHierarchy(): void {
    this.http
      .get(this.BO.companyHierarchy())
      .subscribe((hierarchy: HierarchyNode) => {
        this.hierarchy$.next(hierarchy);
      });
  }

  getHierarchy(): any {
    return this.hierarchy$.getValue;
  }

  getCurrentMonth(): void {
    this.months = this.us.getMonths();
  }

  resetSummaryValues(): void {
    this.summaryValues$.next([]);
    this.monthValues$.next([]);
  }

  initializeKpiValues(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http
      .get<MonthlySummaryReport[]>(this.BO.companyKpiStats())
      .subscribe((reports: MonthlySummaryReport[]) => {
        this.kpiData$.next(reports);
        resolve();
      }, () => reject());
    });
  }

  initalizeGraphicData(monthIdFrom: number, monthIdTo: number): void {
    this.http
      .get(this.BO.companyGraphicStats(monthIdFrom, monthIdTo))
      .subscribe((reports: GraphicSummaryReport[]) => {
        this.graphicData$.next(reports);
      });
  }

  initializeSummaryValues(monthIdFrom: number, monthIdTo: number): void {
    this.http
      .get(this.BO.companySummary(monthIdFrom, monthIdTo))
      .subscribe((values: ProValues) => {
        this.summaryValues$.next(values.period);
        this.monthValues$.next(values.months);
      });
  }

  initializeDetailValues(monthId: number): Promise<FcEntry[]> {
    let promise = new Promise<FcEntry[]>((resolve: any, reject: any) => {
      this.http
        .get(this.BO.companyDetails(monthId))
        .subscribe((forecasts: FcEntry[]) => {
          this.forecastService.addForecasts(forecasts);
          resolve(forecasts);
        });
    });
    return promise;
  }

  initializeProbabilityDetailValues(monthId: number): Promise<FcEntry[]> {
    let promise = new Promise<FcEntry[]>((resolve: any, reject: any) => {
      this.http
      .get<FcEntry[]>(this.BO.companyDetails(monthId))
      .subscribe((forecasts: FcEntry[]) => {
        resolve(forecasts);
      });
    });

    return promise;
  }

  initializeFinancialData(monthIdFrom: number, monthIdTo): Promise<FinancialControllerSummaryAPPS[]> {​​​​​​​​
    let promise = new Promise<FinancialControllerSummaryAPPS[]>((resolve: any, reject: any) => {​​​​​​​​
    this.http
          .get<FinancialControllerSummaryAPPS[]>(this.BO.financialSummary(monthIdFrom,monthIdTo))
          .subscribe((financialSummary: FinancialControllerSummaryAPPS[]) => {​​​​​​​​
          this.financialData$.next(financialSummary);
          resolve(financialSummary);
          }​​​​​​​​);
        }​​​​​​​​);
    return promise;
  }
  
  

  getGraphicData(): GraphicSummaryReport[] {
    return this.graphicData$.getValue();
  }

  getKpiData(): MonthlySummaryReport[] {
    return this.kpiData$.getValue();
  }

  getSummaryValues(): SummaryValues[] {
    return this.summaryValues$.getValue();
  }

  getMonthValues(): SummaryValues[] {
    return this.monthValues$.getValue();
  }

  getFinancialData(): FinancialControllerSummaryAPPS[] {
    return this.financialData$.getValue();
  }

  calculateTeamleadValues(filter: string, team: any[]): any[] {
    let teamleads: any[] = [];

    if (filter === "pl") {
      team
        .filter((u: User) => u.permission === environment.roles.pl || u.roleId === 7 ) //pl or hop
        .forEach((p: User) => {
          let childs: number[] = team
            .filter((c: User) => c.parentId === p.id)
            .map((c: User) => c.id);
          this.getTeamnameForPL(p.id, p.firstName + " " + p.lastName);
          
          teamleads.push({
            id: p.id,
            name: this.getTeamnameForPL(p.id, p.firstName + " " + p.lastName),
            prodUnitCode : p.prodUnitCode,
            childs: [p.id].concat(
              team
                .filter((c: User) => childs.indexOf(c.parentId) >= 0)
                .map((c: User) => c.id)
                .concat(childs)
            ),
          });
        });
    } else {
      team
        .filter(
          (u: User) =>
            u.permission === environment.roles.pdl ||
            u.permission === environment.roles.pl
        )
        .forEach((p: User) => {
          teamleads.push({
            id: p.id,
            name: p.firstName + " " + p.lastName,
            prodUnitCode : p.prodUnitCode,
            childs: [p.id].concat(
              team
                .filter((c: User) => c.parentId === p.id)
                .map((c: User) => c.id)
            ),
          });
        });
    }

    teamleads.forEach((teamlead: any) => {
      teamlead.projectDays = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.projectDays)
        .reduce((a, b) => a + b, 0);

      teamlead.billableDays = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.billableDays)
        .reduce((a, b) => a + b, 0);

      teamlead.vacationDays = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.vacationDays)
        .reduce((a, b) => a + b, 0);

      teamlead.totalDays = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.totalDays)
        .reduce((a, b) => a + b, 0);

      teamlead.ros = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.ros)
        .reduce((a, b) => a + b, 0);

      let fteCss: number = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => u.fte)
        .reduce((a, b) => a + b, 0);
      
      teamlead.fte = fteCss;

      teamlead.cor = teamlead.ros / teamlead.billableDays;

      teamlead.arve = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => parseInt(u.arve, 10))
        .reduce((a, b) => a + b, 0);
      teamlead.arve = (teamlead.arve / fteCss).toFixed(0);

      teamlead.urve = team
        .filter((u: any) => teamlead.childs.indexOf(u.id) >= 0)
        .map((u: any) => parseInt(u.urve, 10))
        .reduce((a, b) => a + b, 0);
      teamlead.urve = (teamlead.urve / fteCss).toFixed(0);
    });

    return teamleads;
  }

  getTeamnameForPL(teamLeadId: number, teamLeadName: string): string {
    let t: Team[] = this.teams.filter(
      (team: Team) => team.teamLeadId == teamLeadId
    );
    if (t.length > 0) {
      return t[0].name;
    } else {
      return teamLeadName;
    }
  }

  /**
   * Returns an observable of the period forecast data for the company
   * Used for csv export
   *
   * @param exportValues
   */
  getCsvExportData(monthIdFrom: number, monthIdTo: number): Observable<any> {
    const httpOptions: object = {
      responseType: "blob" as "json",
    };

    return this.http.get<any>(
      this.BO.companyCsvExport(monthIdFrom, monthIdTo),
      httpOptions
    );
  }
}

export interface ProValues {
  period: SummaryValues[];
  months: SummaryValues[];
}

export interface SummaryValues {
  monthId: number;
  probabilityId: number;
  billableDays: number;
  nonBillableDays: number;
  vacationDays: number;
  trainingDays: number;
  businessDays: number;
  benchDays: number;
  workingDays: number;
  fteCss: number;
  cor: number;
  arve: number;
  urve: number;
  ros: number;
  external: number;
}
