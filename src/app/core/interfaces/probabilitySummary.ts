import { ProbabilityRecord } from "./probabilityRecord";

export class ProbabilitySummary {

	projectDays: number;

	billableDays: number;

	vacationDays: number;

	paidDays: number;

	corDays: number;

	cor: number;

	externalRevenue: number;

	internalRevenue: number;

	revenue: number;

	arve: number;

	urve: number;
    
    probabilites: ProbabilityRecord[];

    nonBillableDays: number;

    nonForecastedDays: number;

    constructor() {
        this.nonBillableDays = 0;
        this.nonForecastedDays = 0;
		this.corDays = 0;
        this.arve = 0;
		this.urve = 0;
		this.revenue = 0;
		this.internalRevenue = 0;
		this.vacationDays = 0;
		this.externalRevenue = 0;
		this.paidDays = 0;
		this.billableDays = 0;
		this.cor = 0;
        this.projectDays = 0;
        this.probabilites = [];
    }
}