import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubcoComponent } from './add-subco.component';

describe('AddSubcoComponent', () => {
  let component: AddSubcoComponent;
  let fixture: ComponentFixture<AddSubcoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSubcoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubcoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
