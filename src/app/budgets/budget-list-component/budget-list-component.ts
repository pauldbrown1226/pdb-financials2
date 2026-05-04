import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { RouterLink } from '@angular/router';
import { Alert } from '../../shared/alert/alert';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation-component/delete-confirmation-component';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { CurrencyPipe } from '@angular/common';
import { BudgetCopyComponent } from '../budget-copy-component/budget-copy-component';

@Component({
  selector: 'app-budget-list-component',
  imports: [MatTableModule, MatButton, LoadingSpinnerComponent, RouterLink, CurrencyPipe],
  templateUrl: './budget-list-component.html',
  styleUrl: './budget-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetListComponent implements OnInit {
  budgetservice = inject(BudgetService);

  budget: Budget;
  budgets: Budget[] = [];

  isLoading = false;
  isDelete = false;

  dataSource = new MatTableDataSource<Budget>([]);
  trackBy = (index: number, el: Budget) => el.budgetId;

  displayedColumns: string[] = [
    'budgetName',
    'budgetDate',
    'annualExpenses',
    'monthlyExpenses',
    'copy',
    'delete',
  ];

  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private budgetCopyDialog: MatDialog,
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
    console.log('BudgetList.ngInit()');
    this.isLoading = true;
    const budgetsString = localStorage.getItem('budgets');
    if (!budgetsString) {
      this.getBudgets();
    } else {
      this.budgets = JSON.parse(budgetsString);
      this.dataSource.data = this.budgets;
      this.isLoading = false;
    }
  }

  getBudgets() {
    this.budgetservice.fetchBudgets().subscribe({
      next: (budgets: Budget[]) => {
        this.budgets = budgets;
        this.dataSource.data = this.budgets;
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
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
  

  onOpenCopyBudget(budget: Budget) {
    this.budget = budget;
    console.log('BudgetList.openCopyBudget: ' + budget.budgetName);
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { budget: budget };
    // dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.position = {
      top: '250px',
    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '90%';
    dialogConfig.minWidth = '90%';

    const dialogRef = this.budgetCopyDialog.open(BudgetCopyComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);

      const newBudget = result.newBudget;
      if (newBudget) {
        this.budgets.splice(0, 0, newBudget);
        this.dataSource.data = [...this.dataSource.data];
        localStorage.setItem('budgets', JSON.stringify(this.budgets));

      }
      console.log('Dialog result before generateAlert', result);
      if (result.editMessage) {
        this.openAlertMessageModal(result.editMessage, false);
      }
      console.log('Dialog result after generateAlert', result);

      return;
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
    console.log('BudgetList.onReset()');
    this.isLoading = true;
    this.getBudgets();
    this.isLoading = false;
  }

  openDeleteConfirmation(budget: Budget) {
    console.log('BudgetListComponent.openDeleteConfirmation');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = {
      deleteType: 'budget',
      id: budget.budgetId,
      label: budget.budgetName,
      deleted: false,
    };

    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.deleteConfirmationDialog.open(DeleteConfirmationComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.isDelete = result.delete;
      this.getBudgets();
    });
  }
}
