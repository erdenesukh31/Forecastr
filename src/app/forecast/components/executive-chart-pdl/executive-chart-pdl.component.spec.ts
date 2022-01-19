import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveChartPdlComponent } from './executive-chart-pdl.component';

describe('ExecutiveChartPdlComponent', () => {
  let component: ExecutiveChartPdlComponent;
  let fixture: ComponentFixture<ExecutiveChartPdlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveChartPdlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveChartPdlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
