import { FcProject } from './fcProject';

/**
 * main forecast entry class
 */
export class FcEntry {
    forecastId?: number;
    subcoForecastId?: number;
    userId: number;
    monthId: number;
    comment: string;
    projects: FcProject[];
    fte: number;
    gradeId: number;
    isRelevant: boolean;

    /**
     * forecast entry cannot be edited if locked-level is >= permission-level
     */
    locked?: number | boolean;

    /**
     * created time for history
     */
    createdAt?: string;
    /**
     * changed by user for history
     */
    changedBy?: string;
    updated?: boolean;
    /**
     * all historic entry values for a forecast with a specific id
     */
    history?: FcEntry[];

    /**
     * arve = (projectdays billable + non-billable) / (totalworkingdays - vacationdays)
     */
    arve?: number;

    /**
     * urve = (projectdays billable) / (totalworkingdays - vacationdays)
     */
    urve?: number;

    /**
     * all billable days
     */
    billableDays?: number;

    /**
     * all days that are set non-billable (can be != total - billable)
     */
    nonbillableDays?: number;

    /**
     * vacation days
     */
    vacationDays?: number;

    /**
     * all project days ( = days from projects where project-type = 0)
     */
    projectDays?: number;

    /**
     * business-development days
     */
    businessDays?: number;

    /**
     * total possible days in a month for a specific user (workingdays per month * user-fte)
     */
    totalDays?: number;
    nonbillableProjectDays?: number;
    cor?: number;
    ros?: number;

    /**
     * if set to true, input fields in fc-entry will be validated instantly (otherwise only when "Save" is clicked)
     */
    instantValidation?: boolean;

    constructor() {
        this.forecastId = undefined;
        this.monthId = undefined;
        this.userId = undefined;
        this.comment = '';
        this.projects = [];
        this.fte = undefined;
        this.gradeId = undefined;
        this.isRelevant = true;
        this.locked = -1;
        this.arve = 0;
        this.urve = 0;
        this.projectDays = 0;
        this.billableDays = 0;
        this.nonbillableDays = 0;
        this.vacationDays = 0;
        this.businessDays = 0;
        this.totalDays = 0;
    }
}
