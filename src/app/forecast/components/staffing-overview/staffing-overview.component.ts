import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange, SimpleChanges, AfterContentInit, AfterViewInit } from "@angular/core";

import { User } from "../../../core/interfaces/user";
import { Month } from "../../../core/interfaces/month";
import { FcEntry } from "../../../core/interfaces/fcEntry";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { UserService } from "../../../core/services/user.service";
import { DatePipe } from "@angular/common";
import { PageStateService } from "../../../core/shared/page-state.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TooltipPosition } from '@angular/material/tooltip';
import { Subscription } from "rxjs";
import { Project } from "../../../core/interfaces/project";
import { UtilitiesService } from "../../../core/services/utilities.service";
import { parseHostBindings } from "@angular/compiler";

class ProjectHelper {
    projectId: number;
    days: number;
    projectCode: String;

    constructor() {
        this.projectId = 0;
        this.days = 0;
        this.projectCode = undefined;
    }

}

@Component({
    selector: 'app-staffing-overview',
    templateUrl: './staffing-overview.component.html',
    styleUrls: ['./staffing-overview.component.scss'],
})
export class StaffingOverviewComponent implements OnInit, OnDestroy, OnChanges {

    @Input('months') months: Month[];

    @Input('users') users: User[];

    /**
      * columns which are displayed
     */
    columnsToDisplay: String[] = [];

    /**
      * list of all forecast entries for all users
     */
    forecasts: FcEntry[] = [];

    projects: Project[] = [];
    // allForecast: FcEntry[] = [];

    projectHelpers: ProjectHelper[] = [];

    forecastrSubscription: Subscription;

    isPageReady: boolean = false;

     isFinished: boolean = false;
    /**
     * constructor for staffing-overview component
     *  @param forecastService
     */
    constructor(
        private forecastService: ForecastService,
        private userService: UserService,
        private datePipe: DatePipe,
        private pageState: PageStateService,
        private utilityService: UtilitiesService
    ) {
    }

    ngOnInit(): void {
        this.pageState.forecastrReady$.subscribe((ready: boolean) => {
            if (ready) {
                this.initStaffing();
            }
        });

    }
    ngOnChanges(): void {
        this.pageState.forecastrReady$.subscribe((ready: boolean) => {
            if (ready) {
                this.initStaffing();
            }
        });
    }

    getTotalARVE(month: Month): string {
        let projectDays = 0;
        let totalDays = 0;
        let vacationDays = 0;

        for (let user of this.users) {
            let forecast: FcEntry = this.forecastService.forecasts.find((fc: FcEntry) => {
                return fc.monthId === month.id && fc.userId === user.id
            });

            if (user.active) {
                if (user.active.valueOf) {
                    if (forecast) {
                        if (forecast.isRelevant) {
                            if (forecast.projectDays) {
                                projectDays += forecast.projectDays;
                            }
                            if (forecast.vacationDays) {
                                vacationDays += forecast.vacationDays;
                            }
                            if (forecast.totalDays) {
                                totalDays += forecast.totalDays;
                            }
                        }
                    }
                }
            }
        }

        let arve = (projectDays) / (totalDays - vacationDays);
        return (arve * 100).toFixed(2);
    }

    getTotalFTE(month: Month): string {
        let fte = 0;

        for (let user of this.users) {
            let forecast: FcEntry = this.forecastService.forecasts.find((fc: FcEntry) => {
                return fc.monthId === month.id && fc.userId === user.id
            });

            if (forecast) {
                //if(forecast.isRelevant) {
                fte += forecast.fte;
                //}
            }
        }

        return fte.toFixed(2);
    }

    getTeam(user: User): String {
        if (user.id === -1) {
            return "";
        }

        let team = user;

        if (team === undefined) {
            return "-";
        }

        let parentId = user.parentId;

        if (parentId === undefined) {
            return team.lastName + ", " + team.firstName;
        }

        let parentUser = this.userService.getUser(parentId);
        let parentRole = this.userService.getRole(parentUser.roleId);

        if (parentUser !== undefined) {
            team = parentUser;

            while (parentUser !== undefined && parentRole !== undefined && (parentRole.shortcut === "CSS" || parentRole.shortcut === "PDL")) {
                parentId = parentUser.parentId;

                if (parentId === undefined) {
                    return team.lastName + ", " + team.firstName;
                }

                parentUser = this.userService.getUser(parentId);

                if (parentUser !== undefined) {
                    parentRole = this.userService.getRole(parentUser.roleId);
                }

                team = parentUser;
            }
        }

        if (team === undefined) {
            return "-";
        }

        return team.lastName + ", " + team.firstName + " (" + parentRole.shortcut + ")";
    }

    getProjectHelper(forecasts: FcEntry[]): ProjectHelper[] {

        let projectHelpers: ProjectHelper[] = []
        var check: boolean = false;
        for (let fcEntry of forecasts) {
            for (let project of fcEntry.projects) {

                let helper = projectHelpers.find((helper: ProjectHelper) => {
                    return helper.projectId === project.projectId;
                });

                if (helper) {
                    helper.days += project.plannedProjectDays;
                }
                else {
                    let projectTemp: Project = this.forecastService.projects.find((pro: Project) => {
                        return pro.id === project.projectId
                    });

                    let projectHelperTemp: ProjectHelper = new ProjectHelper;
                    projectHelperTemp.days = project.plannedProjectDays;
                    projectHelperTemp.projectId = project.projectId;
                    projectHelperTemp.projectCode = projectTemp.name.split('-')[0];
                    projectHelpers.push(projectHelperTemp);
                }
            }
        }
        return projectHelpers;
    }

    getProjects(user: User, viewColumn: String): String {

        const projectIds = []
        if (user.id === -1) {
            return "";
        }

        let forecasts: FcEntry[] = [];
        let forecast: FcEntry;

        for (let month of this.months) {
            forecast = this.forecastService.forecasts.find((fc: FcEntry) => {
                return fc.monthId === month.id && fc.userId === user.id
            });

            if (forecast) {
                forecasts.push(forecast);
            }
            forecast = null;
        }

        if (forecast) {
            forecasts.push(forecast);
        }

        let forecastHelpers = this.getProjectHelper(forecasts);

        if (viewColumn === "table") {
            return this.getProjectCode(forecastHelpers);
        }
        else {
            return this.getProjectCodes(forecastHelpers);
        }
    }

    getProjectCode(forecastHelpers: ProjectHelper[]): String {

        if (forecastHelpers.length <= 0) {
            return "no project";
        }

        forecastHelpers.sort(function (a, b) {
            return a.days - b.days;
        }).reverse();

        return forecastHelpers[0].projectCode.toString();
    }

    getProjectCodes(forecastHelpers: ProjectHelper[]): String {

        if (forecastHelpers.length <= 0) {
            return "no project";
        }

        forecastHelpers.sort(function (a, b) {
            return a.days - b.days;
        }).reverse();

        let returnString = " ";

        for (let helper of forecastHelpers) {
            if (helper.days !== 0) {
                returnString += helper.projectCode + "\n";
            }
        }
        return returnString;
    }

    initStaffing(): void {
        this.projects = this.utilityService.getProjects();
        this.columnsToDisplay = [];
        this.columnsToDisplay.push('name');
        this.columnsToDisplay.push('team');
        this.columnsToDisplay.push("corp");
        this.columnsToDisplay.push("projects");

        for (let month of this.months) {
            this.columnsToDisplay.push(month.name);
        }

        if (!this.users.find((u: User) => u.id === -1)) {
            let user: User = new User();
            user.id = -1;
            user.firstName = "";
            user.lastName = "Total";
            user.globalId = -1;
            user.fte = 0;
            this.users.unshift(user);
        }
    }

    exportCSV(): void {
        this.pageState.showSpinner();

        let lineEnding = "\r\n";
        let header: string = "Employee;Team;Corp Id;" + this.months.map(x => x.name + " ARVE;" + x.name + " FTE").join(";") + lineEnding;

        let body = "";

        let teams = new Map<string, User[]>();

        for (let u of this.users) {
            if (u.id === -1) {
                continue;
            }

            let team = this.getTeam(u);
            let teamContent: User[] = teams.get(team.toString());

            if (teamContent === undefined) {
                teams = teams.set(team.toString(), [u]);
            } else {
                teamContent.push(u);
                teams = teams.set(team.toString(), teamContent);
            }
        }

        let teamNames = Array.from(teams.keys());

        for (let team of teamNames) {
            body += team + lineEnding;
            body += header;
            body += teams.get(team).map(u => u.lastName + ", " + u.firstName + ";" +
                team + ";" +
                u.globalId.toString() + ";" +
                this.months.map(x => this.parseForCSV(this.getMonthARVEFromPerson(x, u), 100, 4, 4) + ";" +
                    this.parseForCSV(this.getMonthFTEFromPerson(x, u), 1, 0)).join(";")).join(lineEnding);
            body += lineEnding + lineEnding;
        }
        //summary
        body += "Summary" + lineEnding;
        body += this.months.map(x => x.name + " ARVE;" + x.name + " FTE").join(";") + lineEnding;
        body += this.months.map(x => this.getTotalARVE(x) + ";" + this.getTotalFTE(x)).join(";") + lineEnding;

        const data = body;
        const blob: Blob = new Blob([data], { type: "text/csv" });
        const filename: string = this.datePipe.transform(new Date(), "yyyyMMdd") + "-AllOverview.csv";

        this.pageState.hideSpinner();

        let navigator: any = window.navigator;
        //For IE
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, filename);
        //For any other browser
        } else {
            const url: string = window.URL.createObjectURL(blob);

            let a: HTMLAnchorElement = document.createElement("a");
            a.href = url;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    parseForCSV(toParse: string, div: number, minPrecision: number = 0, maxPrecision: number = 2): string {
        if (toParse == "-") {
            return "0";
        }

        let n = parseFloat(toParse) / div;
        return n.toLocaleString("de", { minimumFractionDigits: minPrecision, maximumFractionDigits: maxPrecision}).replace(".", "");
    }

    getMonthFTEFromPerson(month: Month, user: User): string {
        if (user.id === -1) {
            return this.getTotalFTE(month);
        }

        let forecast: FcEntry = this.forecastService.forecasts.find((fc: FcEntry) => {
            return fc.monthId === month.id && fc.userId === user.id
        });

        if (forecast) {
            return forecast.fte.toString();
        } else {

            if (user.endDate) {
                let endDate = new Date(user.endDate);
                let currentDate = new Date(month.time);
                if (currentDate > endDate) {
                    return "0";
                }

            }
            return user.fte.toString();
        }
    }

    getMonthARVEFromPerson(month: Month, user: User): string {
        if (user.id === -1) {
            return this.getTotalARVE(month);
        }

        let forecast: FcEntry = this.forecastService.forecasts.find((fc: FcEntry) => {
            return fc.monthId === month.id && fc.userId === user.id
        });

        if (forecast) {
            return (forecast.arve * 100).toFixed(2);
        } else {
            return "-";
        }
    }

    ngOnDestroy(): void {
    }
}