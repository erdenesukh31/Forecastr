export class subCoDetails {
    subCoId: number;
    subCoTypeId: number;
    subCoType: string;
    resourceName: string;
    projectName: string;
    projectId: number;
    customer: string;
    monthId: number;
    forecastId: number;
    manDay: number;
    revenue: number;
    costRate: number;
    cor:number;
    cost: number;
    contribution: number;
    cp: number;
    engagamentManagerID: number;

    constructor() {
        this.subCoId = null;
        this.subCoTypeId = null;
        this.subCoType = '';
	    this.resourceName = '';	
        this.projectName = '';
        this.projectId = null;
        this.customer = '';
        this.monthId = null;
        this.forecastId = null;
        this.manDay = null;
        this.revenue = null;
        this.cor = null;
        this.costRate = null;
        this.cost = null;
        this.contribution = null;
        this.cp = null;
        this.engagamentManagerID = null;	
	}
}
