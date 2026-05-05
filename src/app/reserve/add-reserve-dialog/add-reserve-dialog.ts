import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatError, MatInputModule, MatLabel } from '@angular/material/input';
import { Reserve } from '../../models/reserve.model';
import { ReserveEntry } from '../../models/reserve-entry.model';
import { ReserveService } from '../../services/reserve.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { Category } from '../../models/category-model';


@Component({
  selector: 'app-add-reserve-dialog',
  imports: [
    
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDialogContent,
    MatLabel,
    MatInputModule,
    MatDialogModule,
    MatButton,
    MatError,
    CurrencyPipe,
  ],
  templateUrl: './add-reserve-dialog.html',
  styleUrl: './add-reserve-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddReserveDialog implements OnInit {
  reserveService = inject(ReserveService);
  reserve: Reserve;
  dataSource = new MatTableDataSource<ReserveEntry>([]);
  trackBy = (index: number, el: ReserveEntry) => el.reserveEntryId;

  displayedColumns: string[] = ['categoryLabel', 'balanceAmount', 'amount', 'newBalance'];
  displayTotalColumns: string[];

  private fb = new FormBuilder();
  editForm: FormGroup;
  

  controls: FormArray;

  balance = 0;
  reserveTotal = 0;
  newBalance = 0;

  editMessage: string;
  isLoading = false;
  isError = false;

  totalReserveEntry: ReserveEntry;
  reserveEntries: ReserveEntry[];
  balanceEntries: ReserveEntry[];
  newBalanceEntries: ReserveEntry[];
  reserveEntry: ReserveEntry;

  description: string;
  balanceReserve: Reserve;

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<AddReserveDialog>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef
  ) {
    // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck(); //
    }, 1000);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.initForm();
    this.reserveService.fetchBalanceReserve();
    this.getReserveBalances();
  }

  initForm() {
    this.editForm = this.fb.group({
      description: new FormControl('', [Validators.required, Validators.maxLength(30)]),
    });
  }

  getReserveBalances() {
    this.reserveService.fetchBalanceReserve().subscribe({
      next: (balanceReserve: Reserve) => {
        console.log('in AddReserve.getReserve in next');
        this.balanceReserve = balanceReserve;
        this.balanceEntries = this.balanceReserve.reserveEntries;

        this.balance = balanceReserve.reserveTotal;
        this.reserveTotal = 0;
        this.newBalance = balanceReserve.reserveTotal;

        // populate an empty Reserve
        this.reserve = new Reserve(0, '', null, null, 0, 0);

        let entry: ReserveEntry;
        this.reserveEntries = [];

        // add the totals to the first row.
        entry = new ReserveEntry(
          0,
          this.balance,
          this.balance,
          null,
          new Category(0, 'Total', 'Total', null, null, null, false, false)
        );

        this.reserveEntries.push(entry);

        this.balanceEntries.splice(0, 0, entry);

        for (let i: number = 1; i < this.balanceEntries.length; i++) {
          entry = new ReserveEntry(
            0,
            0,
            this.balanceEntries[i].amount,
            null,
            this.balanceEntries[i].category
          );

          this.reserveEntries.push(entry);
        }

        this.dataSource.data = this.reserveEntries;
        this.reserve.reserveEntries = this.reserveEntries;

        for (let index = 0; index < this.reserveEntries.length; index++) {
          const re = this.reserveEntries[index];
          this.editForm.addControl(re.category.label, new FormControl(0, Validators.max(100000)));
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

  onSubmit() {
    console.log('AddReserveDialog.onSubmit');
    // remove the total reserve entry from reserve Entries
    this.reserveEntries.shift();
    this.reserve.description = this.editForm.value.description;
    this.reserve.reserveTotal = this.reserveTotal;
    this.reserve.reserveSubtotal = this.newBalance;
    this.reserveService.addReserve(this.reserve).subscribe({
      next: (reserve: Reserve) => {
        this.reserve = reserve;
        const dataToReturn = { reserve: this.reserve };
        this.dialogRef?.close(dataToReturn);
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

  calculateNewBlanace(index: number, controlName: string) {
    console.log('AddReserveDialog.calculateNewBlanace');
    const newAmt = Number(this.editForm.get(controlName)?.value);
    const oldAMt = this.reserveEntries[index].amount;
    const difference = newAmt - oldAMt;
    if (difference === 0) {
      return;
    }

    console.log('newAmt = ' + newAmt);
    this.reserveTotal = this.reserveTotal + difference;
    this.reserveEntries[index].amount = newAmt;
    this.reserveEntries[index].subtotal = this.reserveEntries[index].subtotal + difference;
    this.reserveEntries[0].subtotal = this.balance + this.reserveTotal;
    console.log('reserveTotal = ' + this.reserveTotal);
  }

  onReset() {
    console.log('AddReserveDialog.onReset');
    this.initForm();
    this.getReserveBalances();
  }

  onClose() {
    if (this.isError) {
      this.isError = false;
      return;
    }
    const dataToReturn = { reserve: this.reserve };
    this.dialogRef?.close(dataToReturn);
  }
}
