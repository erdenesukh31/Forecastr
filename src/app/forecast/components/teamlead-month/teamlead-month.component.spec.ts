import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamleadMonthComponent } from './teamlead-month.component';

describe('TeamleadMonthComponent', () => {
  let component: TeamleadMonthComponent;
  let fixture: ComponentFixture<TeamleadMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamleadMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamleadMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
