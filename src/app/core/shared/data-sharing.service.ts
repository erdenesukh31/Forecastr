import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class DataSharingService {
    private projectInputFocus = new BehaviorSubject<boolean>(false);
    private projectInputValid = new BehaviorSubject<boolean>(true);
    private corValueBiggerThanZero = new BehaviorSubject<boolean>(false);
    private noOfInvalidInputs = new BehaviorSubject<number>(0);
    
    private isProjectValid = this.projectInputValid.asObservable();
    private hasInputFocus = this.projectInputFocus.asObservable();
    private isCorBiggerThanZero = this.corValueBiggerThanZero.asObservable();
    private invalidInputs = this.noOfInvalidInputs.asObservable();
 
    constructor() {}

    setProjectInputFocus(projectFocus: boolean): void {
        this.projectInputFocus.next(projectFocus);
    }

    hasProjectInputFocus(): Observable<boolean> {
        return this.hasInputFocus;
    }

    setNumberOfInvalidInputs(invalidInputsNumber: number): void {
        this.noOfInvalidInputs.next(invalidInputsNumber);
    }

    numberOfInvalidInputs(): Observable<number> {
        return this.invalidInputs;
    }

    setProjectInputValid(projectValid: boolean): void {
        this.projectInputValid.next(projectValid);
    }

    isProjectInputValid(): Observable<boolean> {
        return this.isProjectValid;
    }

    setCorValueBiggerThanZero(corBiggerThanZero: boolean): void {
        this.corValueBiggerThanZero.next(corBiggerThanZero);
    }

    isCorValueBiggerThanZero(): Observable<boolean> {
        return this.isCorBiggerThanZero;
    }
}