import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
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
import { MatInputModule, } from '@angular/material/input';
import {
  MatFormField,
  MatLabel,
  MatSelect,
  MatOption,
  MatSelectModule,
  MatError,
} from '@angular/material/select';

import { BudgetEntry } from '../../models/budget-entry.model';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/category-model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { Budget } from '../../models/budget.model';
import { BudgetEntryDto } from '../../models/update-budget-entry-dto.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-budget-entry-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDialogContent,
    MatSelectModule,
    MatLabel,
    MatOption,
    MatInputModule,
    MatDialogModule,
    MatButton,
    MatError
  ],
  templateUrl: './budget-entry-edit-dialog.html',
  styleUrl: './budget-entry-edit-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetEntryEditDialog implements OnInit {

  budgetEntry: BudgetEntry;
  categories: Category[] = [];
  categoryMap = new Map();
  editMode = false;
  isLoading = false;
  isError = false;

  editMessage: string;

    private fb = new FormBuilder();

  
    editForm = this.fb.group({
      annualAmount: new FormControl(0, [Validators.required, Validators.max(100000)]),
      monthlyAmount: new FormControl(0, [Validators.max(100000)]),
      categoryName: new FormControl(''),
    });  

  budgetService = inject(BudgetService);
  budgetEntryUpdateObj$: Observable<BudgetEntry>;
  categoryService = inject(CategoryService);

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<BudgetEntryEditDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      budgetId:number;
      budgetEntryId: number;
      insertLocatoin: number;
      editMode: string;
    }
  ) {
    // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck(); //
    }, 1000);
  }

  ngOnInit(): void {
    console.log('BudgetEntryEditDialog.ngOnInit');
    console.log(this.data.budgetEntryId);

    if (this.data.editMode === 'edit') {
      this.editMode = true;
      this.getBudgetEntry(this.data.budgetEntryId);
    } else {
      this.editMode = false;
      this.budgetEntry = new BudgetEntry(0, 0, 0, 0, 0, null, 0, null,0);
       this.initForm();
    }
    this.getCategories();

   
  }

  initForm() {
    console.log('BudgetEntryEditDialog.initForm()');

    let annualAmount = 0;
    let monthlyAmount = 0;
    let categoryName = '';

    if (this.editMode) {
      annualAmount = this.budgetEntry.annualAmount;
      monthlyAmount = this.budgetEntry.monthlyAmount;
      categoryName = this.budgetEntry.category.name;
    }

    
    this.editForm.setValue({
      annualAmount: annualAmount,
      monthlyAmount: monthlyAmount,
      categoryName: categoryName,
    });


    console.log('BudgetEntryEditDialog.initForm return');
  }

getBudgetEntry(budgetEntryId: number) {
    this.budgetService.fetchBudgetEntry(budgetEntryId).subscribe({
      next: (budgetEntry: BudgetEntry) => {
        this.budgetEntry = budgetEntry;
        this.initForm();
        this.isLoading = false;
      },
      error: (errorMessage: HttpErrorResponse) => {
        console.log('BudgetEntryEditDialog.getBudgetEntry');
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.isLoading = false;
        this.openAlertMessageModal(message, true);
        console.log('BudgetEntryEditDialog.getBudgetEntry');
      },
    });
  }

  getCategories() {
    console.log('BudgetEntryEditDialog.getCategories');
    this.categoryService.getCatgories().subscribe({
      next: (categories: Category[]) => {
        console.log('BudgetEntryEditDialog.getCategories.next');
        this.categories = categories;

        // build the budget map
        for (const entry of this.categories ) {
          this.categoryMap.set(entry.name, entry);
        }
        this.isLoading = false;
      },
      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.isLoading = false;
        this.openAlertMessageModal(message, true);
        console.log('categoryList.getCategories Error');
      },
    });
  }

    calculateMonthlyAmount() {
    console.log('calculateMonthlyAmount called');
    let amt: number = this.editForm.value.annualAmount;
    console.log(amt);
    amt = amt / 12;
    amt = Math.round(amt);
    this.editForm.patchValue({ monthlyAmount: amt});
  }


  onSubmit() {
    const newBudgetEntry: BudgetEntry = new BudgetEntry(0, 0, 0, 0, 0, null, 0, null,0);
    const entryDto = new BudgetEntryDto();
    const category: Category = this.categoryMap.get(this.editForm.value.categoryName);
    if (!this.editMode) {

      newBudgetEntry.budgetId = this.data.budgetId;
      newBudgetEntry.annualAmount = this.editForm.value.annualAmount;
      newBudgetEntry.monthlyAmount = this.editForm.value.monthlyAmount;
      newBudgetEntry.reportAmount = 0;
      newBudgetEntry.category = category;
      entryDto.newEntry = newBudgetEntry;
      entryDto.oldEntry = null;
    } else {
      newBudgetEntry.budgetId = this.data.budgetId;
      newBudgetEntry.budgetEntryId = this.budgetEntry.budgetEntryId;
      newBudgetEntry.annualAmount = this.editForm.value.annualAmount;
      newBudgetEntry.prevAnnualAmount = 0;
      newBudgetEntry.monthlyAmount = this.editForm.value.monthlyAmount;
      newBudgetEntry.reportAmount = this.budgetEntry.reportAmount;
      newBudgetEntry.createDate = this.budgetEntry.createDate;
      newBudgetEntry.category = category;
      newBudgetEntry.rowNo = this.budgetEntry.rowNo;

      entryDto.newEntry = newBudgetEntry;
      entryDto.oldEntry = this.budgetEntry;
    }
    this.isLoading = true;
      this.budgetService.updatgeBudgetEntry(entryDto).subscribe({
      next: (budget: Budget) => {
        
        if (this.editMode) {
          this.editMessage = 'BudgetEntry ' + category.name + ' successfully updated.';
        } else {
          this.editMessage = 'BudgetEntry ' + category.name + ' successfully added.';
        }
          const dataToReturn = { budget: budget, editMessage: this.editMessage };
          this.dialogRef?.close(dataToReturn);


              },
      error: (errorMessage: HttpErrorResponse) => {
        console.log('BudgetEntryEditDialog.submit');
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.isLoading = false;
        this.isError = true;
        this.openAlertMessageModal(message, true);
        console.log('BudgetEntryEditDialog.submit');
        this.onClose();
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
      if (!result.isError) {
      this.isError = true;
      this.onClose();
    }
    });
  }

  onClose() {

    if (this.isError) {
      this.isError = false;
      return;
    }
    if (this.editMode) {
      const dataToReturn = { budgetEntry: this.budgetEntry, editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
    } else {
      const dataToReturn = { categorys: [], editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
    }
  }
}
