import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, input, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { ReportEmitErrorSummary } from 'typescript';
import { ReportEntry } from '../../models/report-entry.model';
import { ReportsService } from '../../services/reports-service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Report } from '../../models/report.model';
import { LoadingSpinnerComponent } from "../../shared/loading-spinner/loading-spinner.component";
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category-model';
import { BudgetEntry } from '../../models/budget-entry.model';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';
import { Alert } from '../../shared/alert/alert';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-display-report-component',
  imports: [MatTableModule, MatButton, LoadingSpinnerComponent, CurrencyPipe],
  templateUrl: './display-report-component.html',
  styleUrl: './display-report-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class DisplayReportComponent implements OnInit{

  reportService = inject(ReportsService);
  budgetService = inject(BudgetService);
  reportId = input<number>();

  expensesTotal: number;
  report: Report;
  budgetMap = new Map();
  

  reportEntries: any = [];
  error = false;
  errorMessage: string = null;
  isLoading = false;
  id: number;

  editMessage: string;

  dataSource = new MatTableDataSource<ReportEntry>([]);
  trackBy = (index: number, el: ReportEntry) => el.reportEntryId;

  displayedColumns: string[] = [
    'label', 
    'name', 
    'type', 
    'catOrder',
    'amount',
    'ytdAmount',
    'monthlyBudget',
    'annualBudget',
    'reserve',
    'budget'
  ];

  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private reportEditDialog: MatDialog,
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
      console.log('reportID = ' + this.reportId());
      this.id = this.reportId();
      this.isLoading = true;
      
      this.getReport();

      this.getBudget();
    
    }



    getReport() {
      this.reportService.fetchReport(this.id).subscribe({
        next: (report: Report) => {
        this.report = report;
        this.reportEntries = report.reportEntries;
        this.expensesTotal = report.expensesTotal;
        this.dataSource.data = this.reportEntries;

        this.dataSource.filterPredicate = (data, filter) => {
        // Example: Skip rows where row.hidden is true
        return data.category.name != 'BLANK';
};
this.dataSource.filter = 'update'; // Trigger filtering

        localStorage.setItem('report', JSON.stringify(this.report));
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
        // this.openAlertMessageModal(message, true);
        console.log('reportList.getReports Error');
      },
    });

    }

    getBudget() {

    this.budgetService.fetchLatestBudget().subscribe({
      next: (budget: Budget) => {

        // build the budget map
        for (const entry of budget.budgetEntries ) {
          this.budgetMap.set(entry.category.name, entry);
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
        console.log('reportList.getReports Error');
      },
    })

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

  ifTotal(entry: ReportEntry) {
    if (entry.category.name.includes('TOTAL')) {
      return true;
    } else {
      return false;
    }
  }

  isHeading(cat: Category) {
    if (
      cat.subType === 'HEADING' ||
      cat.subType === 'TOTAL' ||
      cat.subType === 'GRAND_TOTAL' ||
      cat.catOrder === 'MASTER' ||
      cat.catOrder === 'SUBCATMASTER'
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
      return null;
    } else {
      return catType;
    }
  }

  getEntryName(cat: Category) {
    if (
      cat.type === 'BLANK' ||
      cat.type === 'TOTAL' ||
      cat.type === 'HEADING'
    ) {
      return null;
    } else {
      return cat.name;
    }
  }

  getEntryLabel(cat: Category) {
    if (cat.type === 'BLANK') {
      return null;
    } else {
      return cat.label;
    }
  }

  getAnnualAmount(entry: ReportEntry) {

    const budgetEntry: BudgetEntry = this.budgetMap.get(entry.category.name);
    if (budgetEntry && budgetEntry.annualAmount) {
      return budgetEntry.annualAmount;
    } else {
      return null;
    }

  }

  getMonthlyAmount(entry: ReportEntry) {
    const budgetEntry: BudgetEntry = this.budgetMap.get(entry.category.name);
    if (budgetEntry) {
      return budgetEntry.monthlyAmount;
    } else {
      return null;
    }

  }


}
