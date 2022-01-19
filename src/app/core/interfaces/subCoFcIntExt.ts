export class SubCoFcIntExt {
    resourceName: string;
    projectCode: string;
    projectName: string;
    engagementManagerId: number;
    engagementManagerName: string;
    customer: string;
    isEasternEurope: boolean;
    manDay: number;
    revenue: number;
    cost: number;
    contribution: number;
    cp: number;
    monthId: number;

    constructor() {
        this.resourceName = "";
        this.projectName = "";
        this.engagementManagerId = null;
        this.engagementManagerName = "";
        this.isEasternEurope = false;
        this.customer = "";
        this.revenue = 0;
        this.cost = 0;
        this.contribution = 0;
        this.cp = 0;
        this.manDay = 0;
        this.monthId = 0;
    }
}
