import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveStatsComponent } from './executive-stats.component';

describe('ExecutiveStatsComponent', () => {
  let component: ExecutiveStatsComponent;
  let fixture: ComponentFixture<ExecutiveStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutiveStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiveStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
