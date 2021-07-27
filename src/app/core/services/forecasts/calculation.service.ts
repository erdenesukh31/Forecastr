import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FcProject } from '../../interfaces/fcProject';
import { FcEntry } from '../../interfaces/fcEntry';
import { BusinessOperationsService } from '../../shared/business-operations.service';
import { Month } from '../../interfaces/month';
import { UtilitiesService } from '../utilities.service';
import { PageStateService } from '../../shared/page-state.service';
import { UserService } from '../user.service';
import { ForecastService } from './forecast.service';
import { ProbabilitySummary } from '../../interfaces/probabilitySummary';
import { ProbabilityRecord } from '../../interfaces/probabilityRecord';
import { ExecutiveForecastsService } from '../forecasts/executive-forecasts.service';
import { BehaviorSubject } from 'rxjs';
import { PerGrade } from '../../interfaces/perGrade';

/**
 * forecast service
 */
@Injectable({
    providedIn: 'root',
})
export class CalculationService {
    probabilitySummary: ProbabilitySummary;
    probabilitySummaryPerMonth: Map<number, ProbabilitySummary>;
    periodLength: number;
    periodMonths: Month[];
    probabilityForecasts: FcEntry[];
    probabilityForecastsPerMonth: Map<number, FcEntry[]>;
    probabilitySummary$: BehaviorSubject<ProbabilitySummary>;
    probabilitySummaryPerMonth$: BehaviorSubject<Map<number, ProbabilitySummary>>;

    constructor(
        private utilitiesService: UtilitiesService,
        private userService: UserService,
        private executiveService: ExecutiveForecastsService
      ) {
          this.probabilitySummary = new ProbabilitySummary();
          this.probabilitySummaryPerMonth = new Map();

          let probabilities = this.utilitiesService.getProbabilities();
          for(let probability of probabilities) {
              let record = new ProbabilityRecord();
              record.id = probability.id;
              record.name = probability.name;
              this.probabilitySummary.probabilites.push(record);
          }

          this.probabilityForecasts = [];
          this.probabilityForecastsPerMonth = new Map<number, FcEntry[]>();
          this.periodMonths = [];
          this.periodLength = 0;
          this.probabilitySummary$ = new BehaviorSubject(this.probabilitySummary);
          this.probabilitySummaryPerMonth$ = new BehaviorSubject(this.probabilitySummaryPerMonth);
      }

      isUserRelevant(monthId: number, userId: number): boolean {
          let monthIndex = this.utilitiesService.getMonths().findIndex(x => x.id === monthId);
          let month = this.utilitiesService.getMonths()[monthIndex];
          
          if(monthIndex === undefined || monthIndex === -1) {
              return false;
          }

          let user = this.userService.getUser(userId);

          if(user === undefined) {
              return false;
          }

          return true;
      }

      init(from: number, to: number) {
          this.probabilityForecasts = [];
          this.probabilityForecastsPerMonth = new Map<number, FcEntry[]>();
          let months = this.utilitiesService
            .getMonths()
            .filter((m: Month) => m.id >= from && m.id <= to);
          this.periodLength = months.length;
          this.periodMonths = months;

          for(let month of this.periodMonths) {
              this.executiveService.initializeProbabilityDetailValues(month.id).then((entries: FcEntry[]) => {
                  this.probabilityForecastsPerMonth.set(month.id,entries);
                  this.probabilityForecasts = this.probabilityForecasts.concat(entries);
                  this.checkPeriodRequest();
                  this.checkPeriodRequestPerMonth(month.id);
              }).catch(() => {
                  this.checkPeriodRequest();
                  this.checkPeriodRequestPerMonth(month.id);
              });
          }
      }

      initProbabilitySummaryPerMonth(monthId :number): void {
        this.probabilitySummaryPerMonth.set(monthId, this.calculateProbabilitySummary(this.probabilityForecastsPerMonth.get(monthId)));
        this.probabilitySummaryPerMonth$.next(this.probabilitySummaryPerMonth);
      }

      initProbabilitySummary(): void {
          this.probabilitySummary = this.calculateProbabilitySummary(this.probabilityForecasts);
          this.probabilitySummary$.next(this.probabilitySummary);
      }

      getProbabilitySummary(): ProbabilitySummary {
          return this.probabilitySummary;
      }

      calculateProbabilitySummary(entries: FcEntry[]): ProbabilitySummary {
          let probabilities = this.utilitiesService.getProbabilities();
          let summary = new  ProbabilitySummary();

          for(let probability of probabilities) {
              let record = new ProbabilityRecord();
              record.id = probability.id;
              record.name = probability.name;
              summary.probabilites.push(record);
          }

          for(let entry of entries) {
            //   if(!entry.isRelevant) {
            //       continue;
            //   }
              
              if(!this.isUserRelevant(entry.monthId, entry.userId)) {
                  continue;
              }

              summary = this.calculateFcProbabilitySummary(entry, summary);
          }

          Array.from(summary.avgVacationDaysPerGrade.keys()).forEach(key=>{
              summary.avgVacationDaysPerGrade.get(key).getAverage();
          })

          Array.from(summary.avgFTEPerGrade.keys()).forEach(key=>{
            summary.avgFTEPerGrade.get(key).getAverage();
            console.log(summary.avgFTEPerGrade.get(key).average)
        })
          

          summary = this.summarize(summary);
          return summary;
      }

      calculateFcProbabilitySummary(entry: FcEntry, summary: ProbabilitySummary): ProbabilitySummary {
          if(!summary.avgVacationDaysPerGrade.has(entry.gradeId)){
              summary.avgVacationDaysPerGrade.set(entry.gradeId, new PerGrade());
          }
          if(!summary.avgFTEPerGrade.has(entry.gradeId)){
            summary.avgFTEPerGrade.set(entry.gradeId, new PerGrade());
          }

          for(let projectEntry of entry.projects) {
              summary = this.calculateProjectEntryProbabilitySummary(projectEntry, summary, entry.isRelevant, entry.gradeId);
          }


          summary.avgFTEPerGrade.get(entry.gradeId).value += entry.fte;

          summary.avgVacationDaysPerGrade.get(entry.gradeId).users.add(entry.userId);
          summary.avgFTEPerGrade.get(entry.gradeId).users.add(entry.userId);

          let monthIndex = this.utilitiesService.getMonths().findIndex(x => x.id === entry.monthId);
          let month = this.utilitiesService.getMonths()[monthIndex];
          if(entry.isRelevant) {
              summary.paidDays += entry.fte * parseInt(month.workingdays);
          }

          return summary;
      }

      calculateProjectEntryProbabilitySummary(entry: FcProject, summary: ProbabilitySummary, isRelevant: boolean, gradeId: number): ProbabilitySummary {
          let recordIndex = summary.probabilites.findIndex(x => x.id === entry.probabilityId);
          
          if(recordIndex === undefined || recordIndex === -1) {
              return summary;
          }

          let record = summary.probabilites[recordIndex];
          record.paidDays += entry.plannedProjectDays;

          if(entry.projectType === 1) { //billable
            if(!entry.billable) {
                    if(isRelevant) {
                        record.nonBillableDays += entry.plannedProjectDays;
                        summary.nonBillableDays += entry.plannedProjectDays;
                    }
                    
            } else { //billable
                if (isRelevant) {
                    record.billableDays += entry.plannedProjectDays;
                    summary.billableDays += entry.plannedProjectDays;
                }
                if (entry.cor !== 0) {
                    record.corDays += entry.plannedProjectDays;
                    summary.corDays += entry.plannedProjectDays;
                }

                record.revenue += entry.cor * entry.plannedProjectDays;
                summary.revenue += entry.cor * entry.plannedProjectDays;
                
                if(entry.externalRevenue) {
                    record.externalRevenue += entry.cor * entry.plannedProjectDays;
                    summary.externalRevenue += entry.cor * entry.plannedProjectDays;
                } else {
                    record.internalRevenue += entry.cor * entry.plannedProjectDays;
                    summary.internalRevenue += entry.cor * entry.plannedProjectDays;
                }
            }
        } else if(entry.projectType === 4) { //vacation days
            if(isRelevant) {
                record.vacationDays += entry.plannedProjectDays;
                summary.vacationDays += entry.plannedProjectDays;
                summary.avgVacationDaysPerGrade.get(gradeId).value += entry.plannedProjectDays;
            }
        } else if(entry.projectType === 6) { //non billable
            if(!entry.billable) {
                if (isRelevant) {
                    record.nonBillableDays += entry.plannedProjectDays;
                    summary.nonBillableDays += entry.plannedProjectDays;
                }
            } else {
                if (isRelevant) {
                    record.billableDays += entry.plannedProjectDays;
                    summary.billableDays += entry.plannedProjectDays;
                }
                
                if (entry.cor !== 0) {
                    record.corDays += entry.plannedProjectDays;
                    summary.corDays += entry.plannedProjectDays;
                }

                record.revenue += entry.cor * entry.plannedProjectDays;
                summary.revenue += entry.cor * entry.plannedProjectDays;

                if(entry.externalRevenue) {
                    record.externalRevenue += entry.cor * entry.plannedProjectDays;
                    summary.externalRevenue += entry.cor * entry.plannedProjectDays;
                } else {
                    record.internalRevenue += entry.cor * entry.plannedProjectDays;
                    summary.internalRevenue += entry.cor * entry.plannedProjectDays;
                }
            }
        }

        summary.probabilites[recordIndex] = record;

        return summary
      }

      summarizeRecord(record: ProbabilityRecord): ProbabilityRecord {
          record.cor = record.corDays === 0 ? 0 : record.revenue / record.corDays;

          let divisor = record.paidDays - record.vacationDays;
          record.arve = divisor === 0 ? 1 : (record.billableDays + record.nonBillableDays) / (record.paidDays - record.vacationDays);
          record.urve = divisor === 0 ? 1 : (record.billableDays) / (record.paidDays - record.vacationDays);

          return record;
      }

      summarizeTotal(summary: ProbabilitySummary): ProbabilitySummary {
          summary.cor = summary.corDays === 0 ? 0 : summary.revenue / summary.corDays;

          let divisor = summary.paidDays - summary.vacationDays;
          summary.arve = divisor === 0 ? 1 : (summary.billableDays + summary.nonBillableDays) / (summary.paidDays - summary.vacationDays);
          summary.urve = divisor === 0 ? 1 : (summary.billableDays) / (summary.paidDays - summary.vacationDays)

          return summary;
      }

      summarize(summary: ProbabilitySummary): ProbabilitySummary {
          summary = this.summarizeTotal(summary);
          let records = [];
          
          for(let record of summary.probabilites) {
              records.push(this.summarizeRecord(record));
          }

          summary.probabilites = records;

          return summary;
      }

      checkPeriodRequestPerMonth(monthId: number): void {
        if(monthId > 0) {
            this.initProbabilitySummaryPerMonth(monthId);
        }
      }

      checkPeriodRequest(): void {
          this.periodLength = this.periodLength - 1;
          if(this.periodLength <= 0) {
              this.initProbabilitySummary();
          }
      }
}