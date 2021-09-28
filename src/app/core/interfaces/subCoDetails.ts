export class subCoDetails {
    subCoId: number;
    subCoType: string;
    resourceName: string;
    projectName: string;
    customer: string;
    monthId: number;
    forecastId: number;
    manDay: number;
    revenue: number;
    cost: number;
    contribution: number;
    cp: number;
    engagamentManagerID: number;

    constructor() {
        this.subCoId = null;
        this.subCoType = '';
	    this.resourceName = '';	
        this.projectName = '';
        this.customer = '';
        this.monthId = null;
        this.forecastId = null;
        this.manDay = null;
        this.revenue = null;
        this.cost = null;
        this.contribution = null;
        this.cp = null;
        this.engagamentManagerID = null;	
	}
}
