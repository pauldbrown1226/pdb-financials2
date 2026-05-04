import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerEditDialog } from './planner-edit-dialog';

describe('PlannerEditDialog', () => {
  let component: PlannerEditDialog;
  let fixture: ComponentFixture<PlannerEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannerEditDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
