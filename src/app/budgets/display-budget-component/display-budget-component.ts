import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { CurrencyPipe } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BudgetEntry } from '../../models/budget-entry.model';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { Category } from '../../models/category-model';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation-component/delete-confirmation-component';
import { BudgetEntryEditDialog } from '../budget-entry-edit-dialog/budget-entry-edit-dialog';

@Component({
  selector: 'app-display-budget-component',
  imports: [MatTableModule, MatButton, LoadingSpinnerComponent, CurrencyPipe],
  templateUrl: './display-budget-component.html',
  styleUrl: './display-budget-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayBudgetComponent implements OnInit {
  budgetService = inject(BudgetService);
  budgetId = input<number>();
  id: number;

  expensesTotal: number;
  report: Report;
  
  budget: Budget;
  budgetEntry: BudgetEntry;
  budgetEntries: BudgetEntry[] = [];
  error = false;
  errorMessage: string = null;
  isLoading = false;
  budgetEntryId: number;

  editMessage: string;

  dataSource = new MatTableDataSource<BudgetEntry>([]);
  trackBy = (index: number, el: BudgetEntry) => el.budgetEntryId;

  displayedColumns: string[] = [
    'label',
    'name',
    'type',
    'catOrder',
    'reportAmount',
    'annualAmount',
    'monthlyAmount',
    'prevAnnualAmount',
    'reserve',
    'delete',
  ];

  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private budgetEntryEditDialog: MatDialog,
    private deleteConfirmationDialog: MatDialog
  ) {
    // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck();
    }, 1000);
  }

  ngOnInit(): void {
    console.log('DisplayBudgetComponent.ngOnInit');
    this.id = this.budgetId();
    this.isLoading = true;
    this.getBudget();
  }

  getBudget() {
    this.budgetService.fetchBudget(this.id).subscribe({
      next: (budget: Budget) => {
        this.budget = budget;
        this.budgetEntries = budget.budgetEntries;
        this.dataSource.data = this.budgetEntries;
        this.dataSource.filterPredicate = (data, filter) => {
          // Example: Skip rows where row.hidden is true
          return data.category.name != 'BLANK';
        };
        this.dataSource.filter = 'update'; // Trigger filtering

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
        console.log('reportList.getReports Error');
      },
    });
  }

  openEditBudgetEntry(mode: string, budgetEntry: BudgetEntry) {
      if (mode === 'add') {
        this.budgetEntry = new BudgetEntry(0, 0, 0, 0, 0, null, 0, null,0);
      } else {
        this.budgetEntry = budgetEntry;
      }
      console.log('DisplayBudgetComponent.openEditBudgetEntry ' + mode + ' ' + this.budgetEntry);
      let dialogConfig = new MatDialogConfig();
      dialogConfig.data = { budgetId: this.budget.budgetId, budgetEntryId: this.budgetEntry.budgetEntryId, insertLocation: this.budgetEntry.rowNo, editMode: mode };
      dialogConfig.panelClass = 'custom-dialog-container';
      dialogConfig.position = {
        top: '250px',
  
      };
      dialogConfig.disableClose = true;
      dialogConfig.width = '90%';
      dialogConfig.minWidth = '90%';
  
      const dialogRef = this.budgetEntryEditDialog.open(BudgetEntryEditDialog, dialogConfig);
  
      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog result:', result);
        this.budgetEntries = this.budget.budgetEntries;
        console.log('Dialog result before generateAlert', result);
        if (result.editMessage) {
          this.openAlertMessageModal(result.editMessage, false);
        }
        console.log('Dialog result after generateAlert', result);
        this.onReset();
        return;
      });
    }
  

  openDeleteConfirmation(budgetEntry: BudgetEntry) {
    console.log('DisplayBudgetComponent.openDeleteConfirmation');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = {
      deleteType: 'budgetEntry',
      id: budgetEntry.budgetEntryId,
      label: budgetEntry.category.label,
      deleted: false,
    };

    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.deleteConfirmationDialog.open(DeleteConfirmationComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.getBudget();
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
    });
  }

  onReset() {
    console.log('DisplayBudgetComponent.onReset()');
    this.isLoading = true;
    this.getBudget();
    
  }

  ifTotal(entry: BudgetEntry) {
    if (entry.category.name.includes('TOTAL')) {
      return true;
    } else {
      return false;
    }
  }

  isHeading(cat: Category) {
    if (
      cat.type === 'HEADING' ||
      (cat.type === 'TOTAL' && cat.catOrder === 'MASTER') ||
      cat.catOrder === 'MASTER'
    ) {
      return true;
    } else {
      return false;
    }
  }

  isSubcategory1(order: string) {
    if (order === 'SUBCATEGORY1' || order === 'SUBCATMASTER') {
      return true;
    } else {
      return false;
    }
  }
  isSubcategory2(order: string) {
    if (order === 'SUBCATEGORY2') {
      return true;
    } else {
      return false;
    }
  }

  getType(catType) {
    if (catType === 'BLANK') {
      return '';
    } else {
      return catType;
    }
  }

  getEntryName(cat: Category) {
    if (cat.type === 'BLANK' || cat.type === 'TOTAL' || cat.type === 'HEADING') {
      return '';
    } else {
      return cat.name;
    }
  }

  getEntryLabel(cat: Category) {
    if (cat.type === 'BLANK') {
      return '';
    } else {
      return cat.label;
    }
  }

  getEntryType(cat: Category) {
    if (cat.type === 'BLANK') {
      return '';
    } else {
      return cat.type;
    }
  }

  getReportExpTotal() {
    if (this.budget) {
      return this.budget.reportExpTotal;
    } else {
      return '';
    }
  }
  getAnnualExpTotal() {
    if (this.budget) {
      return this.budget.annualExpTotal;
    } else {
      return '';
    }
  }

  getMonthlyExpTotal() {
    if (this.budget) {
      return this.budget.monthlyExpTotal;
    } else {
      return '';
    }
  }

  getReserveTotal() {
    if (this.budget) {
      return this.budget.reserveTotal;
    } else {
      return '';
    }
  }
}
