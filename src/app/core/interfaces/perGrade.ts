export class PerGrade {
    value : number;
    count: number;
    average : number;

    getAverage() : number{
        this.average = this.value/this.count;
        return this.average;
    }
    
    constructor(){
        this.value = 0;
        this.count = 0;
        this.average = 0;
    }
}