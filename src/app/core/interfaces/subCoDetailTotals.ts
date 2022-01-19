import { SubCoTotals } from "./subCoTotals";

export class SubCoDetailTotals{
    monthId: number;
    subcontractorTotals: SubCoTotals;
 
    constructor(){
        this.monthId = 0;
        this.subcontractorTotals=null;    
    }
}

