export class SubCoDetails {
    subcontractorId: number;
    subcontractorTypeId: number;
    subcontractorTypeName: string;
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
    engagementManagerId: number;

    constructor() {
        this.subcontractorId = null;
        this.subcontractorTypeId = null;
        this.subcontractorTypeName = '';
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
        this.engagementManagerId = null;	
	}
}
