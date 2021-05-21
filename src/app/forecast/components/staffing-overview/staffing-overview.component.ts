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

@Component({
    selector: 'app-staffing-overview',
    templateUrl: './staffing-overview.component.html',
    styleUrls: ['./staffing-overview.component.scss'],
})
export class StaffingOverviewComponent implements OnInit, OnDestroy/**, OnChanges */ {

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

    // allForecast: FcEntry[] = [];

    /**
     * constructor for staffing-overview component
     *  @param forecastService
     */
    constructor(
        private forecastService: ForecastService,
        private userService: UserService,
        private datePipe: DatePipe,
        private pageState: PageStateService,
    ) {
    }

    ngOnInit(): void {
        this.initStaffing();
    }

    // async ngAfterViewInit(): Promise<void> {
    //     console.log(this.allForecast)
    //     for (let month in this.months) {
    //         for (let user in this.users) {
    //             await this.allForecast.push(this.forecastService.forecasts.find((fc: FcEntry) => {
    //                 return fc.monthId === this.months[month].id && fc.userId === this.users[user].id
    //             }))

    //         }
    //     }
    //     console.log("clear");
    // }

    // ngAfterViewInit(): void {
    //     // console.log(this.allForecast)
    //     // for (let month in this.months) {
    //     //     for (let user in this.users) {
    //     //         this.allForecast.push(this.forecastService.forecasts.find((fc: FcEntry) => {
    //     //             return fc.monthId === this.months[month].id && fc.userId === this.users[user].id
    //     //         }))

    //     //     }
    //     // }
    //     console.log("clear");
    // }

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

    getProjects(user: User): String {
        // const projectIds = []
        // // let forecastr: FcEntry[] = []
        // if (user.id === -1) {
        //     return "";
        // }
        // // console.log(user)
        // let userId = user.id
        // // for loop on the months
        // for (let month in this.months) {
        //     console.log(this.months[month])
        // }
        // for (let month in months) {

        //  }
        // let forecastr: any = this.forecastService.forecasts.find((fc: FcEntry) => {
        //     return (fc.userId === user.id)
        // })
        // if (forecastr) { console.log(forecastr) }
        // forecastr.projects.map((project) => {
        //     projectIds.push(project.projectId)
        // })

        // console.log(this.forecasts);
        // const jopa =(){
        //     return console.log()
        // }
        // return function (): String { return "projects \n projects \n projects" }
        // console.log(this.allForecast)

        // dernier essai
        // let projects: any = []
        // for (let entry in this.allForecast) {
        //     if (this.allForecast[entry]) {
        //         if (this.allForecast[entry].userId === user.id) {
        //             projects.push(this.allForecast[entry].projects)
        //         }
        //     }
        // }
        // console.log(projects)
        // console.log("hello")
        // let projects: any = []
        // for (let month in this.months) {
        //     let forecast: FcEntry = this.forecastService.forecasts.find((fc: FcEntry) => {
        //         return fc.monthId === this.months[month].id && fc.userId === user.id
        //     });
        //     projects.push(forecast)
        // }
        // console.log(projects)
        return "projects"
    }

    initStaffing(): void {
        this.columnsToDisplay = [];
        this.columnsToDisplay.push('name');
        this.columnsToDisplay.push('team');
        this.columnsToDisplay.push("corp");
        this.columnsToDisplay.push("projects");
        console.log("init", this.months, this.users)
        for (let month of this.months) {
            this.columnsToDisplay.push(month.name);
        }
        if (!this.users.find((u: User) => u.id === -1)) {
            let user: User = new User();
            user.id = -1;
            user.firstName = "";
            user.lastName = "Total";
            user.globalId = 0;
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
                this.months.map(x => this.parseForCSV(this.getMonthARVEFromPerson(x, u), 4, 100) + ";" +
                    this.parseForCSV(this.getMonthFTEFromPerson(x, u), 0, 1)).join(";")).join(lineEnding);
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

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
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

    parseForCSV(toParse: string, min: number, div: number): string {
        if (toParse == "-") {
            return "0";
        }

        let n = parseFloat(toParse) / div;
        return n.toLocaleString("de", { minimumFractionDigits: min }).replace(".", "");
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