import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveChartComponent } from './subco-executive-chart.component';

describe('ExecutiveChartComponent', () => {
  let component: ExecutiveChartComponent;
  let fixture: ComponentFixture<ExecutiveChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
