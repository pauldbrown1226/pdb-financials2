import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReportsService } from '../../services/reports-service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Alert } from '../../shared/alert/alert';
import { Report } from '../../models/report.model';
import { MatButton } from '@angular/material/button';


@Component({
  selector: 'app-add-report-dialog',
  imports: [MatButton],
  templateUrl: './add-report-dialog.html',
  styleUrl: './add-report-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddReportDialog implements OnInit {

  
  report: Report;
  errorMessage: string;
  editMessage: string;

  reportService = inject(ReportsService);

  reportFiles: string[] = [];
  
   numberOfTicks = 0;

constructor(
    public dialogRef: MatDialogRef<AddReportDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,

  ) {
        // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck();
    }, 1000);

  }

  ngOnInit(): void {
    console.log('AddReportDialog.ngOnit');

    this.reportService.fetchReportNames().subscribe({

          next: (reportFiles: string[]) => {
        this.reportFiles = reportFiles;

      },
      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message,true);

        console.log('AddReportDialog.ngOnit Error');
      },
    });

  }

  onSelectFile(reportName: string) {

    this.reportService.addReport(reportName).subscribe({
          next: (report: Report) => {
        this.report= report;
        this.editMessage = 'Report ' + reportName + ' successfully added.';
          },
        error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message,true);

        console.log('AddReportDialog.ngOnit Error');
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

      const dataToReturn = { editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
  }


}
