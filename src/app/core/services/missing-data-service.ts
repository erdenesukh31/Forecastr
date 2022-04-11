import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BusinessOperationsService } from '../shared/business-operations.service';
import { HttpClient } from '@angular/common/http';
import { MissingUserData } from '../interfaces/missingPersonData';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateMissingPersonData } from '../interfaces/updateMissingPersonData';
import { User } from '../interfaces/user';

/**
 * missing data service
 */
@Injectable({
  providedIn: 'root',
})
export class MissingDataService {

  missingUserData$: BehaviorSubject<MissingUserData>;

  /**
    * missing data service constructor
    * @param http
    * @param snackBar
    * @param BO
    * @param pageState
    */
  constructor(
    private http: HttpClient,
    private BO: BusinessOperationsService,
    private snackBar: MatSnackBar,
  ) {

    this.missingUserData$ = new BehaviorSubject(new MissingUserData());
  }

  initializeMissingUserData(email: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.get<MissingUserData>(this.BO.getMissingUserData(email))
        .subscribe((missingData: MissingUserData) => {
          this.missingUserData$.next(missingData);
          console.log(missingData);
          resolve();
        }, () => reject());
    });

  }

  setMissingUserData(missingData: UpdateMissingPersonData): void {
    this.http.put(this.BO.setMissingUserData(), missingData).subscribe(
      (u: User) => {
        this.snackBar.open("Set information successfully!", "OK", {
          duration: 5000,
        });
        // this.pageState.hideSpinner();
      },
      (e: any) => {
        this.snackBar.open("Information could not be saved!", "OK", {
          duration: 10000,
        });
        //   this.pageState.hideSpinner();
      }
    );
  }
}