import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogConfig,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { PlannerService } from '../../services/planner.service';
import { Planner } from '../../models/planner.model';
import { PlannerDetails } from '../../models/planner-details.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-planner-detail-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './planner-detail-edit-dialog.html',
  styleUrl: './planner-detail-edit-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerDetailEditDialog implements OnInit {
  plannerService = inject(PlannerService);

  pd: PlannerDetails;
  planners: Planner[];

  editMode = false;
  isLoading = false;

  editMessage: string;

  private fb = new FormBuilder();

  editForm = this.fb.group({
    rateOfReturn: new FormControl(0),
    inflation: new FormControl(0),
    endingAge: new FormControl(0),
    incomeTaxRate: new FormControl(0),
  });

  constructor(
    public dialogRef: MatDialogRef<PlannerDetailEditDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { planner: Planner }
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    console.log('PlannerDetailsEdit.ngOnInit');

    this.getPlannerDetails();
  }

  initForm() {
    this.editForm.setValue({
      rateOfReturn: this.pd.rateOfReturn,
      inflation: this.pd.inflation,
      endingAge: this.pd.endingAge,
      incomeTaxRate: this.pd.incomeTaxRate,
    });
  }

  getPlannerDetails() {
    this.plannerService.fetchPlannerDetails().subscribe({
      next: (plannerDetails: PlannerDetails) => {
        console.log('in PlannerDetailsEditComponent.ngOnInit.subscribe');

        this.pd = plannerDetails;
        this.isLoading = false;
        this.initForm();
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message, true);

        console.log('categoryEdit.getCategories Error');
      },
    });
  }

  onSubmit() {
    this.pd.rateOfReturn = this.editForm.value.rateOfReturn;
    this.pd.inflation = this.editForm.value.inflation;
    this.pd.endingAge = this.editForm.value.endingAge;
    this.pd.incomeTaxRate = this.editForm.value.incomeTaxRate;

    this.isLoading = true;

    this.plannerService.updatePlannerDetails(this.pd).subscribe({
      next: (plannerDetails: PlannerDetails) => {
        this.pd = plannerDetails;
        console.log('PlannerDetailsEdit.onSubmit');

        this.isLoading = false;
        this.editMessage = 'Planner Details was successfully updated';
        this.onClose();
      },
      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message, true);
        console.log('categoryEdit.getCategories Error');
      },
    });
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

  onClose() {
    const dataToReturn = { pd: this.pd, editMessage: this.editMessage };
    this.dialogRef?.close(dataToReturn);
  }
}
