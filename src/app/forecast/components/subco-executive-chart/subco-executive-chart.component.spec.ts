import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcoExecutiveChartComponent } from './subco-executive-chart.component';

describe('ExecutiveChartComponent', () => {
  let component: SubcoExecutiveChartComponent;
  let fixture: ComponentFixture<SubcoExecutiveChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcoExecutiveChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcoExecutiveChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
