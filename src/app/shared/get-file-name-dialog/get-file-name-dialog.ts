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
  MatDialogConfig,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError, MatLabel, MatOption, MatSelectModule } from '@angular/material/select';
import { ReserveService } from '../../services/reserve.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../alert/alert';
import { FileSelect } from '../../models/file-select.model';


@Component({
  selector: 'app-get-file-name-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDialogContent,
    MatSelectModule,
    MatLabel,
    MatOption,
    MatInputModule,
    MatDialogModule,
    MatButton,
  ],
  templateUrl: './get-file-name-dialog.html',
  styleUrl: './get-file-name-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFileNameDialog implements OnInit {
  reserveService = inject(ReserveService);

  type: string;
  title: string;
  fileNames: string[];
  month: string;
  thisYear: string;
  lastYear: string;
  nextYear: string;
  error = false;
  errorMessage: string;
  editMessage: string;

  isLoading = false;
  isError = false;

  private fb = new FormBuilder();
  editForm: FormGroup;

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<GetFileNameDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      myTitle: string;
      myType: string;
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
    console.log('GetFileName.ngOnInit');

    this.type = this.data.myType;

    this.initForm();

    this.reserveService.getFileNames(this.type).subscribe({
      next: (fileNames: string[]) => {
        this.fileNames = fileNames;
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

  initForm() {

    const date: Date = new Date();
    const year = date.getFullYear();
    this.lastYear = '' + (year - 1);
    this.thisYear = '' + year;
    this.nextYear = '' + (year + 1);

    this.month = date.toLocaleString('default', { month: 'long' });


    this.editForm = this.fb.group({
      fileName: new FormControl(''),
      year: new FormControl(this.thisYear),
      month: new FormControl(this.month),
    });
  }

  onSubmit() {
    

      const fileName = this.editForm.value.fileName;
      const year = this.editForm.value.year;
      const month = this.editForm.value.month;
      const fileSelect: FileSelect = new FileSelect(fileName, year + '-' + month);
      const dataToReturn = { fileSelect: fileSelect, fileType: this.type };
      this.dialogRef?.close(dataToReturn);
      
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
    const dataToReturn = { fileNames: this.fileNames };
    this.dialogRef?.close(dataToReturn);
  }
}
