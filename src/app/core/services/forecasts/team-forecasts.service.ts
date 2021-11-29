import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FcProject } from '../../interfaces/fcProject';
import { Project } from '../../interfaces/project';
import { FcEntry } from '../../interfaces/fcEntry';
import { SummaryData, SummaryDataProject } from '../../interfaces/summaryData';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { UtilitiesService } from '../utilities.service';
import { Export } from '../../interfaces/exportCSV/export';
import { User } from '../../interfaces/user';
import { Entry } from '../../interfaces/exportCSV/entry';

/**
 * team forecast service
 */
@Injectable({
  providedIn: 'root',
})
export class TeamForecastService {
  /**
   * contains all projects
   */
  projects: Project[];

  /**
   * constructor for team-forecast service
   * 
   * @param http
   * @param BO
   * @param utilitiesService
   */
  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
    private utilitiesService: UtilitiesService,
  ) {
    this.utilitiesService.projects$
      .subscribe((projects: Project[]) => {
        this.projects = projects;
      });
  }

  /**
   * Get the TeamForecast from the Backend for giving userId & monthId
   * 
   * @param userId
   * @param monthId
   */
  getTeamForecast(userId: number, monthId: number, levelId: number): Observable<FcEntry[]> {
    return this.http
      .get<FcEntry[]>(this.BO.teamForecast(userId, monthId, levelId));
  }

  getTeamForecastPromise(userId: number, monthId: number, levelId: number): Promise<FcEntry[]> {
    return new Promise<any>((resolve: any, reject: any) => {
      this.http
        .get<FcEntry[]>(this.BO.teamForecast(userId, monthId, levelId))
        .subscribe((forecasts: FcEntry[]) => {
          resolve(forecasts);
        }, (e: any) => {
          reject();
        });
    });
  }

  /**
   * Returns an observable of the monthly forecast data for one team
   * Used for csv export
   * 
   * @param exportValues
   */
  getMonthlyForecast(exportValues: Export): Observable<Export> {
    const httpOptions: object = {
      responseType: 'blob' as 'json',
    };

    return this.http
      .post<Export>(this.BO.monthlyForecast(), exportValues, httpOptions);
  }

  /**
   * Returns an observable of the period forecast data for one team
   * Used for csv export
   * 
   * @param exportValues
   */
  getPeriodForecast(exportValues: Export[]): Observable<Export[]> {
    const httpOptions: object = {
      responseType: 'blob' as 'json',
    };

    return this.http
      .post<Export[]>(this.BO.periodForecast(), exportValues, httpOptions);
  }

  /**
   * reutrns the summarydata to the provided forecast-entries
   * 
   * @param fcEntries
   * @param workingDays
   * @param team
   */
  getSummaryData(fcEntries: FcEntry[], workingDays: number, team: User[]): SummaryData {
  //  console.log("Get Summary Data")
    let summaryData: SummaryData = {
      days: this.getEmptyData(),
      revenue: 0,
      workingDays: 0,
      billableDays: 0,
      nonbillableDays: 0,
      arve: 0,
      urve: 0,
      extRevenue: 0,
      intRevenue: 0,
    };

    team.forEach((user: User) => {
      summaryData.workingDays += user.fte ? (user.fte * workingDays) : workingDays;
    });

    if (fcEntries.length === 0) {
      return summaryData;
    }

    if (this.projects.length > 0) {
      fcEntries.forEach((fcEntry: FcEntry) => {
        if (fcEntry.fte && team.find((u: User) => u.id === fcEntry.userId)) {
          summaryData.workingDays -= (team.find((u: User) => u.id === fcEntry.userId).fte - fcEntry.fte) * workingDays;
        }

        if (fcEntry.projects) {
          fcEntry.projects.forEach((fcProject: FcProject) => {
           
            let project: Project = this.projects.find((p: Project) => p.id === fcProject.projectId);
       
            summaryData.days
              .filter((sd: SummaryDataProject) => sd.type === (project ? project.projectType : 0))
              .forEach((sd: SummaryDataProject) => {
               
                  sd.days += (fcProject.plannedProjectDays ? fcProject.plannedProjectDays : 0);
              });

            if (fcProject.billable && fcEntry.isRelevant) {
              summaryData.revenue += (fcProject.cor && fcProject.plannedProjectDays) ? (fcProject.cor * fcProject.plannedProjectDays) : 0;
              summaryData.extRevenue += (fcProject.externalRevenue && fcProject.cor && fcProject.plannedProjectDays) ? (fcProject.cor * fcProject.plannedProjectDays) : 0;;
              summaryData.intRevenue += (!fcProject.externalRevenue && fcProject.cor && fcProject.plannedProjectDays) ? (fcProject.cor * fcProject.plannedProjectDays) : 0;;
              summaryData.billableDays += (fcProject.plannedProjectDays ? fcProject.plannedProjectDays : 0);
            }  else if (!fcProject.billable && fcEntry.isRelevant) {
              summaryData.nonbillableDays += (fcProject.plannedProjectDays ? fcProject.plannedProjectDays : 0);
            }
          });
        }
      });
    }

    let totalDays: number = 0;
    summaryData.days.forEach((sd: SummaryDataProject) => {
      totalDays = totalDays + sd.days;
    });
  
    summaryData.arve = 0;
    summaryData.urve = 0;

    //----------------------------------------------------------------------------------------

    let proDays = 0
    let bilDays = 0
    let nobilDays = 0
    let vacDays = 0

    fcEntries.forEach((fe: FcEntry) => {
      if (fe.isRelevant) {
        proDays += fe.projectDays
        bilDays += fe.billableDays
        nobilDays += fe.nonbillableDays
        vacDays += fe.vacationDays
      }
    });

    let vacationDays = 0;
    let projektDays = 0;

    summaryData.days.forEach((vacD: SummaryDataProject) => {
      if (vacD.title == "Vacation days") {
        vacationDays = vacD.days;

      }
      if (vacD.title == "Project days") {
        projektDays = vacD.days;
      }

    }
    );

    //let denominator = summaryData.billableDays + summaryData.nonbillableDays - vacationDays;

    let denominator = bilDays + nobilDays - vacDays;

    summaryData.arve = proDays / denominator;
    summaryData.urve = bilDays/ denominator;
    return summaryData;
  }

  /**
   * Returns the export data for one months in the exact format the backend needs them to generate a csv file
   * 
   * @param fcEntries
   * @param user
   * @param monthId
   * @param workingDays
   */
  getMonthlyExportData(fcEntries: FcEntry[], user: User[], monthId: number, workingDays: number): Export {
    let csvExportItem: Export = new Export();
    csvExportItem.monthId = monthId;

    user.forEach((u: User) => {
      let temp: Entry = new Entry();
      temp.urve = 0;
      temp.arve = 0;
      temp.workingDays = 0;
      temp.ros = 0;

      let userForecast: FcEntry = fcEntries.find((fc: FcEntry) => fc.userId === u.id);

      temp.name = u.firstName + ' ' + u.lastName;
      if (userForecast) {
        temp.urve = parseFloat((userForecast.urve * 100).toFixed(0));
        temp.arve = parseFloat((userForecast.arve * 100).toFixed(0));

        if (userForecast.projects.length > 0) {
          temp.workingDays = userForecast.projects
            .map((p: FcProject) => (p.plannedProjectDays ? p.plannedProjectDays : 0))
            .reduce((pSum: number, a: number) => pSum + a);
          temp.ros = userForecast.projects
            .map((p: FcProject) => ((p.plannedProjectDays ? p.plannedProjectDays : 0) * (p.cor ? p.cor : 0)))
            .reduce((pSum: number, a: number) => pSum + a);
        }
      }

      csvExportItem.employeeEntry.push(temp);
    });

    let summaryData: SummaryData = this.getSummaryData(fcEntries, workingDays, user);
    csvExportItem.summary.projectDays = summaryData.days.find((sd: SummaryDataProject) => sd.type === 0).days;
    csvExportItem.summary.businessDevelopmentDays = summaryData.days.find((sd: SummaryDataProject) => sd.type === 1).days;
    csvExportItem.summary.trainingDays = summaryData.days.find((sd: SummaryDataProject) => sd.type === 2).days;
    csvExportItem.summary.vacationDays = summaryData.days.find((sd: SummaryDataProject) => sd.type === 3).days;
    csvExportItem.summary.billableDays = summaryData.billableDays;
    csvExportItem.summary.nonbillableDays = summaryData.nonbillableDays;

    csvExportItem.summary.totalWorkingDays = summaryData.workingDays;
    csvExportItem.summary.arve = parseInt((summaryData.arve * 100).toFixed(0), 10);
    csvExportItem.summary.urve = parseInt((summaryData.urve * 100).toFixed(0), 10);
    csvExportItem.summary.ros = summaryData.revenue;

    return csvExportItem;
  }

  /**
   * inits the summarydata-projects with empty data
   */
  getEmptyData(): SummaryDataProject[] {
    return [
      { title: 'Project days', days: 0, type: 0 },
      { title: 'Business development days', days: 0, type: 1 },
      { title: 'Training days', days: 0, type: 2 },
      { title: 'Vacation days', days: 0, type: 3 },
    ];
  }

  setForecastsLockState(monthId: number, level: number, lockState: boolean): Promise<any> {
    return new Promise<any>((resolve: any, reject: any) => {
      this.http.put(this.BO.setTeamLockState(monthId, level), { lockState: lockState })
        .subscribe((forecasts: FcEntry[]) => {
          resolve(forecasts);
        }, (e: any) => {
          reject();
        });
    });
  }
}
