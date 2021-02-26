/**
 * forecast project structure (projects that have been assigned to a forecast)
 */
export class FcProject {
    projectId: number;
    plannedProjectDays: number;
    probabilityId: number;

    /**
     * Is project billable?
     * default: true
     * Automatically set to false for vacation + training + business development days
     */
    billable?: boolean;

    /**
     * employee cor for project
     */
    cor: number;

    /**
     * Project generates external revenue
     * default: true
     * Automatically set to false for vacation + training + business development days
     */
    externalRevenue?: boolean;

    /**
     * project type
     * default: 0, 1 - xx: special types (vacation, ...)
     */
    projectType?: number;

    /**
     * Is project mandatory?
     * Set to true for vacation + training + business development days
     */
    mandatory?: string;

    /**
     * List of errors if validation was unsuccessful
     */
    errors?: string[];

    constructor() {
        this.projectId = undefined;
        this.plannedProjectDays = 0;
        this.probabilityId = null;
        this.cor = 0;
        this.externalRevenue = true;
        this.billable = true;
        this.mandatory = 'N';
        this.projectType = 0;
    }
}
