import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogConfig, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatError, MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { PlannerService } from '../../services/planner.service';
import { Planner } from '../../models/planner.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { MatPseudoCheckbox } from "@angular/material/core";

@Component({
  selector: 'app-planner-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatFormField,
    MatError,
    MatLabel,
    MatDialogActions,
    MatDialogModule,
    MatButton,
],
  templateUrl: './planner-edit-dialog.html',
  styleUrl: './planner-edit-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerEditDialog implements OnInit{

  plannerService = inject(PlannerService);

  planner: Planner;
  planners: Planner[];

  thisYear: number;
  year: number;


 isLoading = false;
  editMessage: string;

  editForm: FormGroup;
  private fb = new FormBuilder();
  

  constructor(
    public dialogRef: MatDialogRef<PlannerEditDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { planner: Planner}
  ) {}


  ngOnInit(): void {
    console.log('PlannerEditDialog.ngOnInit');
    console.log(this.data.planner);
    this.planner = this.data.planner;
    this.year = this.planner.year;

    const currentDate: Date = new Date();
    this.thisYear = currentDate.getFullYear();

    this.initForm();
  }

  initForm() {

    console.log('PlannerEditDialog.initForm()');
    this.editForm = this.fb.group({
      actual: new FormControl({value: this.planner.actual, disabled: true}),
      age: new FormControl({value: this.planner.age, disabled: true}),
      year: new FormControl({value: this.planner.year, disabled: true}),

      investmentTotal: new FormControl({value: this.planner.investmentTotal,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(10000000),
      ]),
      paulPension: new FormControl({value: this.planner.paulPension, disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(100000),
      ]),
      paulSocialSecurity: new FormControl({value: this.planner.paulSocialSecurity,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(100000),
      ]),
      naomiSocialSecurity: new FormControl({value: this.planner.naomiSocialSecurity,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(10000000),
      ]),
      budget: new FormControl({value: this.planner.budget,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(200000),
      ]),
      investmentIncome: new FormControl({value: this.planner.investmentIncome,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(10000000),
      ]),
      incomeTax: new FormControl({value: this.planner.incomeTax,  disabled: this.isFuture(this.planner.year) }, [
        Validators.required,
        Validators.max(100000),
      ]),
      bigExpenses: new FormControl(this.planner.bigExpenses, [
        Validators.max(1000000),
      ]),
      bigExpensesDescription: new FormControl(this.planner.bigExpensesDescription,
        Validators.maxLength(50))    });
    console.log('PlannerEditDialog.initForm return');
  }

  onSubmit() {
    console.log('PlannerEditDialog.onSubmit');

    this.isLoading = true;
    this.storePlanner(this.planner, this.editForm);

    this.plannerService.updatePlanner(this.planner).subscribe({
      next: (planners: Planner[]) => {
        this.onClose();
      },
      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message,true);
        console.log('PlannerEditDialog.onSubmit Error');
      },
    });

  }

  storePlanner(p: Planner, editForm: FormGroup) {

    p.actual = !this.isFuture(p.year);
    if (p.actual) {
      p.investmentTotal = editForm.value.investmentTotal;
      p.paulPension = editForm.value.paulPension;
      p.paulSocialSecurity = editForm.value.paulSocialSecurity;
      p.naomiSocialSecurity = editForm.value.naomiSocialSecurity;
      p.budget = editForm.value.budget;
      p.incomeTax = editForm.value.incomeTax;
    }
    p.bigExpenses = editForm.value.bigExpenses;
    p.bigExpensesDescription = editForm.value.bigExpensesDescription;

  }

  openAlertMessageModal(message: string, isError: boolean) {
    let dialogConfig = new MatDialogConfig();

    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = { message: message, isError: isError };
    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.alertDialog.open(Alert, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
        this.onClose();
    });
  }

    isFuture(year: number) {

    if (year > this.thisYear) {
      return true;
    } else {
      return false;
    }
  }

  isActual(planner: Planner) {
    if (planner.actual) {
      return 'Actual';
    } else {
      return 'Estimate';
    }
  }



  onClose() {

      const dataToReturn = { planners: this.planners, editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
  }


}
