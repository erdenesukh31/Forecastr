import { Component, OnInit, OnDestroy } from "@angular/core";
import { Location } from '@angular/common';
import { ActivatedRoute } from "@angular/router";

import { UtilitiesService } from "../../../core/services/utilities.service";
import { Month } from "../../../core/interfaces/month";
import { UserService } from "../../../core/services/user.service";
import { Subscription } from "rxjs";
import { PageStateService } from "../../../core/shared/page-state.service";
import { AuthService } from "../../../core/security/auth.service";
import { environment as env } from "../../../../environments/environment.prod";
import { TeamUserService } from '../../../core/services/forecasts/team-user.service';
import { MonthService } from "../../../core/services/admin/months.service";
import { LockedMonth } from "../../../core/interfaces/lockedMonth";
import { ForecastService } from "../../../core/services/forecasts/forecast.service";
import { ExecutiveForecastsService } from '../../../core/services/forecasts/executive-forecasts.service';

/**
 * team forecast-view component
 */
@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["../../forecast.component.scss", "./team.component.scss"]
})
export class TeamComponent implements OnInit, OnDestroy {
  months: Month[] = [];
  monthSubscription: Subscription;

  /**
	 * id of currently logged-in user (received from auth-service)
	 */
	userId: number;

  /**
	 * index of currently selected tab (= month)
	 */
  activeMonth: number = 0;

  step: number = -1;

  /**
	 * team forecast-view component constructor
	 */
  constructor(
    private location: Location,
		private route: ActivatedRoute,
    private utilitiesService: UtilitiesService,
    private userService: UserService,
    private pageState: PageStateService,
    private authService: AuthService,
    private teamService: TeamUserService,
    private monthService: MonthService,
    private forecastService: ForecastService,
    private executiveService: ExecutiveForecastsService
  ) {
    this.userId = this.authService.getUserId();
  }

  /**
   * Initializes teamlead component
   */
  ngOnInit(): void {
		this.pageState.forecastrReady$.subscribe((ready: boolean) => {
			if (ready && this.authService.hasRole(env.roles.pdl)) {
				this.initTeamForecast();
			}
		});
  }

  /**
   * Unsubscribes services when component gets destroyed
   */
  ngOnDestroy(): void {
    this.monthSubscription.unsubscribe();
  }

  private initTeamForecast(): void {
    this.teamService.initializePDLTeam();
    this.monthSubscription = this.utilitiesService.months$
      .subscribe((months: Month[]) => {
        this.months = months.filter((m: Month) => m.active === true);
        var today = new Date();
        var todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        this.months = this.months.filter((m: Month) => new Date(m.time) >= todayMonth);

				if(this.months.length > 7) {
					this.months = this.months.slice(1, 7);
        }
        
        let id: number = parseInt(this.route.snapshot.paramMap.get('id'), 10);
        if (typeof id !== 'undefined' && id >= 0 && id < this.months.length) {
          this.activeMonth = id;
  
        } else {
          for (let i: number = 0; i < this.months.length; i++) {
            if (Date.parse(this.months[i].time) > (new Date()).setMonth((new Date().getMonth() - 1))) {
              this.activeMonth = i;
              break;
            }
          }
        }

        setTimeout(() => {
					let shift: number = parseInt(window.getComputedStyle(document.querySelector('.mat-tab-label-container')).width) - parseInt(window.getComputedStyle(document.querySelector('.mat-tab-list')).width);
					let pos: number = parseInt((document.querySelector('.mat-tab-label-active') as HTMLElement).getAttribute('aria-posinset'), 10);
					if (shift < ((pos ? pos : 1) - 1) * -100) {
						shift = ((pos ? pos : 1) - 1) * -100;
					}

					(document.querySelector('.mat-tab-list') as HTMLElement).style.transform = 'translateX(' + shift + 'px)';
				}, 100);
      });

      this.monthService.getLockedMonths().subscribe(
        (lockedMonths: LockedMonth[]) => {
          let activeLockedMonths = lockedMonths.filter((m: LockedMonth) => this.months.find((x: Month) => x.id === m.id) !== undefined);
          for(let i = 0; i < this.months.length; i++) {
            this.months[i].locked = activeLockedMonths[i].locked;
          }
        }
      );
  }

  /**
   * Changes active month, if change to an other tab.
   * @param index
   */
  setTabActive(index: number): void {
    this.activeMonth = index;
    this.location.replaceState('/forecast/team/' + this.activeMonth);
  }

  forecastState(type: string, monthId: number): boolean {
		return this.forecastService.checkForecastState(type, monthId, this.userId);
	}

  setStep(event : number){
    this.step = event;
  }
}
