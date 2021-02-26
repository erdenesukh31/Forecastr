export class ProbabilityRecord {

	id: number;

	name: string;

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

	nonBillableDays: number;
	
  constructor() {
		this.nonBillableDays = 0;
		this.id = 0;
		this.name = "";
		this.arve = 0;
		this.urve = 0;
		this.revenue = 0;
		this.internalRevenue = 0;
		this.vacationDays = 0;
		this.externalRevenue = 0;
		this.corDays = 0;
		this.paidDays = 0;
		this.billableDays = 0;
		this.cor = 0;
		this.projectDays = 0;
    }
}