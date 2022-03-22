import { Component, Inject, OnInit, OnChanges, ModuleWithComponentFactories } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../core/security/auth.service";

import { getStartedData } from "./getStartedData";
import { environment as env } from '../../../environments/environment';
import { MissingDataService } from '../../core/services/missing-data-service';
import { MissingUserData } from "../../core/interfaces/missingPersonData";
import { UpdateMissingPersonData } from "../../core/interfaces/updateMissingPersonData";
/**
 * Component to show get-started dialog
 */
@Component({
    templateUrl: './get-started.html',
    styleUrls: ['./get-started.scss'],
})
export class GetStarted implements OnInit {

    /**
     * data variable for all dialog steps
     */
    tutorialData: any[];
    isEngagementManager: boolean = false;

    workingHoursSliderValue: number = 0;
    workingHoursValue: number = 0;
    prodUnitCode: string;
    startDate: string;
    isValid: boolean = false;
    isMissingUserData: MissingUserData;
    missingPersonData: UpdateMissingPersonData;
    isDataMissing: boolean = false;

    minDate: Date;
    maxDate: Date;

    /**
     * getstarted component constructor
     * @param dialogRef
     * @param data
     * @param auth
     */
    constructor(
        public dialogRef: MatDialogRef<GetStarted>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private auth: AuthService,
        private missingDataService: MissingDataService
    ) { }

    /**
     * check if is pdl or normal user
     */
    ngOnInit(): void {
        this.tutorialData = [];
        if (this.auth.hasRole(env.roles.pl)) {
            this.tutorialData = getStartedData.pl;
        } else if (this.auth.hasRole(env.roles.pdl)) {
            this.tutorialData = getStartedData.pdl;
        } else {
            this.tutorialData = getStartedData.css;
        }
        this.missingDataService.missingUserData$.subscribe((data: MissingUserData) => {
            this.isMissingUserData = data;

            if (this.isMissingUserData.isMissingEngagementManager || this.isMissingUserData.isMissingProdUnitCode ||
                this.isMissingUserData.isMissingStartDate || this.isMissingUserData.workingHours == 0) {
                this.isDataMissing = true;
                this.workingHoursValue = this.isMissingUserData.workingHours;
                this.workingHoursSliderValue = this.workingHoursValue;
                this.tutorialData.unshift(getStartedData.firstLogin[0])
                const currentYear = new Date().getFullYear();
                this.minDate = new Date(currentYear - 10, 0, 1);
                this.maxDate = new Date(currentYear + 1, 11, 31);
            }
        })
    }

    validateValues(): boolean {
        if (this.workingHoursValue > 0) {
            if ((this.isMissingUserData.isMissingStartDate && this.startDate) || !this.isMissingUserData.isMissingStartDate) {
                this.isValid = true;
            } else {
                this.isValid = false;
            }

            if (this.isMissingUserData.isMissingProdUnitCode && this.prodUnitCode || !this.isMissingUserData.isMissingProdUnitCode) {
                this.isValid = true;
            } else {
                this.isValid = false;
            }

        } else {
            this.isValid = false;
        }

        return this.isValid;
    }

    /**
     * close the getStarted
     */
    onNoClick(): void {
        this.dialogRef.close();
    }

    submitData(): void {

        this.missingPersonData = new UpdateMissingPersonData();
        this.missingPersonData.personId = this.auth.getUserId();
        this.missingPersonData.workingHours = this.workingHoursValue;
        this.missingPersonData.isEngagementManager = this.isEngagementManager;
        if (this.isMissingUserData.isMissingProdUnitCode) {
            this.missingPersonData.prodUnitCode = this.prodUnitCode;
        };

        if (this.isMissingUserData.isMissingStartDate) {
            let date: Date = new Date(this.startDate.valueOf());
            this.missingPersonData.startDate = new Date((date.getTime() - (date.getTimezoneOffset() * 60000))).toISOString().slice(0, -5);
        };

        this.missingDataService.setMissingUserData(this.missingPersonData);
        this.isDataMissing = false;

    }
}
