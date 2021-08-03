import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../core/security/auth.service";

import { getStartedData } from "./getStartedData";
import { environment as env } from '../../../environments/environment';

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
    ) {}

    /**
     * check if is pdl or normal user
     */
    ngOnInit(): void {
        if (this.auth.hasRole(env.roles.pl)) {
            this.tutorialData = getStartedData.pl;
        } else if(this.auth.hasRole(env.roles.pdl)) {
            this.tutorialData = getStartedData.pdl;
        } else {
            this.tutorialData = getStartedData.css;
        }
    }

    /**
     * close the getStarted
     */
    onNoClick(): void {
        this.dialogRef.close();
    }
}
