
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

import { Month } from '../../../core/interfaces/month';
import { Subscription } from 'rxjs';
import { UtilitiesService } from '../../../core/services/utilities.service';
import { PageStateService } from '../../../core/shared/page-state.service';
import { environment as env } from "../../../../environments/environment.prod";
import { ActivatedRoute } from '@angular/router';
import { LockedMonth } from '../../../core/interfaces/lockedMonth';
import { MonthService } from '../../../core/services/admin/months.service';
import { AuthService } from '../../../core/security/auth.service';
import { TeamUserService } from '../../../core/services/forecasts/team-user.service';
import { ForecastService } from '../../../core/services/forecasts/forecast.service';

@Component({
  selector: 'app-subcos',
  templateUrl: './subcos.component.html',
  styleUrls: ['./subcos.component.scss']
})
export class SubcosComponent implements OnInit, OnDestroy {
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

  /**
   * Number of the header in the child's expansion panel currently open
   */
  step: number = -1;

  constructor(
    private location: Location,
		private route: ActivatedRoute,
    private utilitiesService: UtilitiesService,
    private monthService: MonthService,
    private pageState: PageStateService,
    private authService: AuthService,
    private teamService: TeamUserService,
    private forecastService: ForecastService
  ){
    this.userId = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.pageState.forecastrReady$.subscribe((ready: boolean) => {
			if (ready && this.authService.hasRole(env.roles.pdl)) {
				this.initTeamForecast();
			}
		});
  }

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

  forecastState(type: string, monthId: number): boolean {
		return this.forecastService.checkForecastState(type, monthId, this.userId);
	}

  setTabActive(index: number): void {
    this.activeMonth = index;
    this.location.replaceState('/forecast/subcos/' + this.activeMonth);
  }

  //Reflect a step change from teamlead-month into parent
  setStep(event : number){
    this.step = event;
  }

}