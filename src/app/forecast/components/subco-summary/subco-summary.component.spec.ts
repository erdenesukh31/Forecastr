import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamleadSummaryComponent } from './teamlead-summary.component';

describe('TeamleadSummaryComponent', () => {
  let component: TeamleadSummaryComponent;
  let fixture: ComponentFixture<TeamleadSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamleadSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamleadSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
