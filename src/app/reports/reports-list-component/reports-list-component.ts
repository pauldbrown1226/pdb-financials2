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
import { Report } from '../../models/report.model';
import { ReportsService } from '../../services/reports-service';
import { AddReportDialog } from '../add-report-dialog/add-report-dialog';

@Component({
  selector: 'app-reports-list-component',
  imports: [MatTableModule, MatButton, LoadingSpinnerComponent, RouterLink],
  templateUrl: './reports-list-component.html',
  styleUrl: './reports-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsListComponent implements OnInit {
  reportService = inject(ReportsService);

  report: Report;
  reports: Report[] = [];

  isLoading = false;
  isDelete = false;

  dataSource = new MatTableDataSource<Report>([]);
  trackBy = (index: number, el: Report) => el.reportId;

  displayedColumns: string[] = ['reportName', 'reportDate', 'expensesTotal', 'delete'];

  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private addReportDialog: MatDialog,
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
    console.log('ReportsList.ngInit()');
    this.isLoading = true;
    const reporsString = localStorage.getItem('reports');
    if (!reporsString) {
      this.getReports();
    } else {
      this.reports = JSON.parse(reporsString);
      this.dataSource.data = this.reports;
      this.isLoading = false;
    }
  }
  getReports() {
    this.reportService.fetchReports().subscribe({
      next: (reports: Report[]) => {
        this.reports = reports;
        this.dataSource.data = this.reports;
        localStorage.setItem('reports', JSON.stringify(this.reports));
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

  
  OpenDeleteConfirmation(index: number) {}

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
    console.log('ReportsList.onReset()');
    this.isLoading = true;
    this.getReports();
    this.isLoading = false;
  }

  openDisplayReport(id: number) {

  }

  openAddReport() {

    console.log('ReportListComponent.openAddReport');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog-container';

    dialogConfig.position = {
      top: '20px',
      left: '900px',
    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '260px';
    dialogConfig.minWidth = '260px';
    dialogConfig.height = '800px';
    // dialogConfig.maxWidth = '100px';

    const dialogRef = this.addReportDialog.open(AddReportDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      if (result.editMessage) {
      this.openAlertMessageModal(result.editMessage, false);
      }
      this.getReports();
    });
  }

  openDeleteConfirmation(report: Report) {
    console.log('ReportListComponent.openDeleteConfirmation');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = {
      deleteType: 'report',
      id: report.reportId,
      label: report.reportName,
      deleted: false,
    };

    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '20%';

    const dialogRef = this.deleteConfirmationDialog.open(DeleteConfirmationComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.isDelete = result.delete;
      this.getReports();
    });
  }
}
