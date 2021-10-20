export class SubCoFcIntExt {
    resourceName: string;
    projectCode: string;
    projectName: string;
    engagementManagerId: number;
    customer: string;
    isEasternEurope: boolean;
    manday: number;
    revenue: number;
    cost: number;
    contribution: number;
    cp: number;

    constructor() {
        this.resourceName = "";
        this.projectName = "";
        this.engagementManagerId = null;
        this.isEasternEurope = false;
        this.customer = "";
        this.revenue = 0;
        this.cost = 0;
        this.contribution = 0;
        this.cp = 0;
    }
}
