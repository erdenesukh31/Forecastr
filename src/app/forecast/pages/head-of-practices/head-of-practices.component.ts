import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PageStateService } from '../../../core/shared/page-state.service';
import { environment as env } from "../../../../environments/environment.prod";
import { Location } from '@angular/common';

@Component({
    selector: "app-head-of-practices",
    templateUrl: "./head-of-practices.component.html",
    styleUrls: ["../../forecast.component.scss", "./head-of-practices.component.scss"],
  })
export class HeadOfPracticesComponent implements OnInit, OnDestroy { 

    constructor(
	) {
    }

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}
}