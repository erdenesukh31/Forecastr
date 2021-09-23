import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcosComponent } from './subcos.component';

describe('SubcosComponent', () => {
  let component: SubcosComponent;
  let fixture: ComponentFixture<SubcosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
