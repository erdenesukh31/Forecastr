import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveChartPlComponent } from './executive-chart-pl.component';

describe('ExecutiveChartPdlComponent', () => {
  let component: ExecutiveChartPlComponent;
  let fixture: ComponentFixture<ExecutiveChartPlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveChartPlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveChartPlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
