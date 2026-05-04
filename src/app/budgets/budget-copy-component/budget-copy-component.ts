import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { MatError, MatInputModule, MatLabel } from '@angular/material/input';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-budget-copy-component',
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatFormFieldModule,
    MatDialogActions,
    MatLabel,
    MatDialogModule,
    MatButton,
    MatError,
  ],
  templateUrl: './budget-copy-component.html',
  styleUrl: './budget-copy-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetCopyComponent implements OnInit {
  budgetService = inject(BudgetService);

  budget: Budget;
  budgetId: number;
  
  editForm: FormGroup;
  private fb = new FormBuilder();

  errorMessage: string;
  editMessage: string;
  editMode = false;
  isLoading = false;
  deleteAuthor = false;

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<BudgetCopyComponent>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { budget: Budget }
  ) {}

  ngOnInit(): void {
    console.log('CopyBudget.ngOnInit');
    this.budget = this.data.budget;
    this.initForm();
  }

  initForm() {
    this.editForm = this.fb.group({
      newBudgetName: new FormControl('', [Validators.required, Validators.maxLength(75)]),
    });
  }

  onSubmit() {
    const newBudgetName: string = this.editForm.value.newBudgetName;
    this.isLoading = true;

    this.budgetService.copyBudget(this.budget.budgetId, newBudgetName).subscribe({
      next: (newBudget: Budget) => {
        this.editMessage =
          'Budget:  ' + this.budget.budgetName + ' successfully copied to: ' + newBudgetName;
        const dataToReturn = { newBudget: newBudget, editMessage: this.editMessage };
        this.dialogRef?.close(dataToReturn);
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
    const dataToReturn = { status: 'returned' };
    this.dialogRef?.close(dataToReturn);
  }
}
