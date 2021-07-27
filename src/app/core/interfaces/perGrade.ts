export class PerGrade {
    value : number;
    count: number;
    users: Set<number>;
    average : number;

    getAverage() : number{
        this.average = this.value/this.users.size;
        return this.average;
    }
    
    constructor(){
        this.value = 0;
        this.count = 0;
        this.average = 0;
        this.users = new Set();
    }
}