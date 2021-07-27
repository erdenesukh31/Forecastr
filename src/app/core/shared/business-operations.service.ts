import { Injectable } from '@angular/core';
import { environment as env } from '../../../environments/environment';

/**
 * business-operations service: provides the urls for all possible requests
 */
@Injectable({
  providedIn: 'root',
})
export class BusinessOperationsService {
  /**
   * returns login-path
   */
  login(): string {
    return env.api + env.authPath + '/login';
  }

  /**
   * returns token-refresh path
   */
  renewToken(): string {
    return env.api + env.authPath + '/refresh-token';
  }

  /**
   * returns get all team-members path
   */
  getUsers(): string {
    return env.api + env.usersPath;
  }

  getTeam(level: number): string {
    return env.api + env.teamPath + '/level/' + level;
  }

  setTeamLockState(monthId: number, level: number): string {
    return env.api + env.teamPath + '/level/' + level + '/month/' + monthId + '/lock';
  }

  getLockedMonths(): string {
    return env.api + env.forecastsPath + '/' + env.lockedPath;
  }

  getSavedMonths(): string {
    return env.api + env.forecastsPath + '/' + env.savedPath;
  }

  /**
   * returns get user by id path
   * @param userId
   */
  getUser(userId: number): string {
    return env.api + env.usersPath + '/' + userId;
  }

  /**
   * returns get own user path
   */
  getOwnUser(): string {
    return env.api + 'user/me';
  }

  updateUser(userId: number): string {
    return env.api + env.usersPath + '/' + userId;
  }

  createUser(): string {
    return env.api + env.usersPath
  }

  setUserState(userId: number): string {
    return env.api + env.usersPath + '/' + userId + '/active';
  }

  /**
   * returns get roles path
   */
  getRoles(): string {
    return env.api + env.rolePath;
  }

  /**
   * returns get grades path
   */
  getGrades(): string {
    return env.api + env.gradePath;
  }

  /**
   * returns get months path
   */
  getUtilMonths(): string {
    return env.api + env.utilsPath + '/months';
  }

  /**
   * returns get months path
   */
  getAdminMonths(): string {
    return env.api + env.monthsPath;
  }

  /**
   * add/update a project
   */
  setMonths(): string {
    return env.api + env.monthsPath;
  }

  setMonthState(): string {
    return env.api + env.monthsPath + '/active';
  }

  /**
   * returns get projects path
   */
  getUtilProjects(): string {
    return env.api + env.utilsPath + '/projects';
  }

  /**
   * returns get projects path
   */
  getAdminProjects(): string {
    return env.api + env.projectsPath;
  }

  /**
   * add/update a project
   */
  setProject(): string {
    return env.api + env.projectsPath;
  }

  setProjectState(): string {
    return env.api + env.projectsPath + '/active';
  }

  getTeams(): string {
    return env.api + env.utilsPath + '/' + env.teamUtilsPath;
  }

  setTeam(): string {
    return env.api + env.utilsPath + '/' + env.teamUtilsPath;
  }

  deleteTeam(teamId: number): string {
    return env.api + env.utilsPath + '/' + env.teamUtilsPath + '/' + teamId;
  }

  /**
   * returns get probabilities path
   */
  getProbabilities(): string {
    return env.api + env.utilsPath + '/probabilities';
  }

  /**
   * returns get single forecast path
   */
  forecast(userId: number, monthId: number): string {
    return env.api + env.forecastsPath + '/user/' + userId + '/months/' + monthId;
  }

  /**
   * returns get forecasts for all team-members path
   */
  teamForecast(teamleadId: number, monthId: number, levelId: number = 0): string {
    return env.api + env.forecastsPath + '/team/' + teamleadId + '/months/' + monthId + '/level/' + levelId;
  }

  /**
   * 
   */
  unlockForecast(userId: number, monthId: number): string {
    return env.api + env.forecastsPath + '/user/' + userId + '/months/' + monthId + '/unlock';
  }

  /**
   * returns get monthly forecast path
   */
  monthlyForecast(): string {
    return env.api + env.forecastsPath + '/export';
  }

  /**
   * returns get period forecast path
   */
  periodForecast(): string {
    return env.api + env.forecastsPath + '/export-team';
  }

  /**
   * returns get forecast history path
   */
  forecastHistory(forecastId: number): string {
    return env.api + env.forecastsPath + '/' + forecastId + '/history';
  }

  /**
   * returns company data summary for executive view
   */
  companySummary(monthIdFrom: number, monthIdTo: number): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/summary/' + monthIdFrom + '/' + monthIdTo;
  }

  /**
   * returns company data details for executive view
   */
  companyDetails(monthId: number): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/detail/' + monthId;
  }

  /**
   * returns csv with summarized company data
   */
  companyCsvExport(monthIdFrom: number, monthIdTo: number): string {
    return env.api + env.forecastsPath + '/export-summary/month/' + monthIdFrom + '/' + monthIdTo;
  }

  /**
   * returns kpi stats path
   */
  companyKpiStats(): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/kpi-stats';
  }

  /**
   * returns graphic stats path
   */
  companyGraphicStats(monthIdFrom: number, monthIdTo: number): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/graphics-data/' + monthIdFrom + '/' + monthIdTo;
  }

  /**
   * returns hierarchy path
   */
  companyHierarchy(): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/hierarchy';
  }

  /**
   * return reqeust path for projects
   */
  requestProject(): string {
    return env.api + env.projectsPath + '/request';
  }

  /**
   * returns forcasts for staffing for month
  */
  staffingForecasts(monthId: number): string {
    return env.api + env.forecastsPath + '/' + env.executivePath + '/' + monthId;
  }

  financialSummary(monthIdFrom: number, monthIdTo: number): string {
    console.log(env.api + env.forecastsPath + '/' + env.executivePath + '/financial-summary/' + monthIdFrom + '/' + monthIdTo);
   return env.api + env.forecastsPath + '/' + env.executivePath + '/financial-summary/' + monthIdFrom + '/' + monthIdTo;
}
}
