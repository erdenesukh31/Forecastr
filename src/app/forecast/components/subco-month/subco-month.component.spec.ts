import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcoMonthComponent } from './subco-month.component';

describe('SubcoMonthComponent', () => {
  let component: SubcoMonthComponent;
  let fixture: ComponentFixture<SubcoMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcoMonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcoMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
