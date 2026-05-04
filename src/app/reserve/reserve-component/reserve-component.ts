import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { Reserve } from '../../models/reserve.model';
import { ReserveTotals } from '../../models/reserve-totals.model';
import { ReserveEntry } from '../../models/reserve-entry.model';
import { ReserveService } from '../../services/reserve.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ReservePage } from '../../models/reserve-page.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { MatButton } from '@angular/material/button';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
// import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Category } from '../../models/category-model';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GetFileNameDialog } from '../../shared/get-file-name-dialog/get-file-name-dialog';
import { FileSelect } from '../../models/file-select.model';
import { Observable } from 'rxjs';
import { AddReserveDialog } from '../add-reserve-dialog/add-reserve-dialog';
import { EditReserveTotals } from '../edit-reserve-totals/edit-reserve-totals';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation-component/delete-confirmation-component';

@Component({
  selector: 'app-reserve-component',
  imports: [MatButton, LoadingSpinnerComponent, CurrencyPipe, ScrollingModule],
  templateUrl: './reserve-component.html',
  styleUrl: './reserve-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReserveComponent implements OnInit {
  reserveService = inject(ReserveService);
  reserveObj$: Observable<ReservePage>;

  totalElements = 0;
  totalPages = 0;
  pageSize = 8;
  pageNo = 0;
  numberRows = 0;
  colNo = 1;
  arrowleft = false;

  highLightRow = 999;

  reserves: any = [];
  reserve: Reserve;
  balanceReserve: Reserve;
  reserveTotals: ReserveTotals;
  reserveTotal = 0;
  errorMessage: string = null;
  isLoading = false;
  isDelete = false;
  isError = false;

  reserveEntries: ReserveEntry[];
  reserveEntry: ReserveEntry;

  title = 'Reserves';
  fileName = '';
  description = '';

  currentYear = new Date().getFullYear();

  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private fileNameDialog: MatDialog,
    private addReserveDialog: MatDialog,
    private editReserveTotalsDialog: MatDialog,
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
    console.log('reservesComponent.ngOnInit()');
    this.reserveTotals = new ReserveTotals(0, 0);
    this.highLightRow = 999;
    this.isLoading = true;
    this.pageNo = 0;
    this.colNo = 1;
    const reservesString = localStorage.getItem('reserves');
    if (!reservesString) {
      this.reserves = new Array();
      this.isLoading = true;
      this.reserveObj$ = this.reserveService.fetchReserves('0');
      this.getReserves();
    } else {
      this.reserves = JSON.parse(reservesString);
      this.balanceReserve = this.reserves[0];
      this.reserveTotal = this.balanceReserve.reserveTotal;
      this.reserve = this.reserves[0];
      this.reserveEntries = this.balanceReserve.reserveEntries;
      this.numberRows = this.reserve.reserveEntries.length;

      const reserveTotalsString = localStorage.getItem('reserveTotals');
      if (reserveTotalsString) {
        this.reserveTotals = JSON.parse(reserveTotalsString);
      }
    }
    this.isLoading = false;
  }

  onReset() {
    console.log('ReservesComponent.onReset()');
    this.isLoading = true;
    this.highLightRow = 999;
    this.pageNo = 0;
    this.colNo = 1;

    this.reserves = new Array();
    this.isLoading = true;
    this.reserveObj$ = this.reserveService.fetchReserves('0');
    this.getReserves();

    this.isLoading = false;
  }

  getReserves() {
    console.log('ReservesComponent.getReserves');
    this.reserveObj$.subscribe({
      next: (reservePage: ReservePage) => {
        console.log('in ReservesComponent.getReserves in subscribe');

        const rp: ReservePage = reservePage;

        this.totalElements = rp.totalElements;
        this.totalPages = rp.totalPages;
        this.reserveTotals.quickenTotal = rp.quickenTotal;
        this.reserveTotals.cmaTotal = rp.cmaTotal;
        this.reserves = rp.reserves;
        this.balanceReserve = this.reserves[0];
        this.reserve = this.reserves[0];
        this.pageSize = this.reserves.length - 1;
        this.numberRows = this.reserve.reserveEntries.length;
        this.reserveTotal = this.balanceReserve.reserveTotal;
        this.reserveEntries = this.reserve.reserveEntries;

        this.isLoading = false;
        localStorage.setItem('reserves', JSON.stringify(this.reserves));
        localStorage.setItem('numberReserverRows', JSON.stringify(this.numberRows));
        localStorage.setItem('reserveTotals', JSON.stringify(this.reserveTotals));
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

  @HostListener('document:keyup', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      // scroll left
      if (this.colNo > 1) {
        this.colNo--;
        return;
      }
      if (this.pageNo === 0) {
        console.log('pageNo = ' + this.pageNo);
        return;
      }

      this.pageNo--;
      this.colNo = 8;
      this.arrowleft = true;
      console.log('pageNo = ' + this.pageNo);
      this.reserveObj$ = this.reserveService.fetchReserves('' + this.pageNo);
      this.getReserves();
    }

    if (event.key === 'ArrowRight') {
      // scroll right

      if (this.colNo < this.pageSize) {
        this.colNo++;
        return;
      } else if (this.pageNo + 1 === this.totalPages) {
        return;
      }

      this.pageNo++;
      this.colNo = 0;
      console.log('pageNo = ' + this.pageNo);
      this.reserveObj$ = this.reserveService.fetchReserves('' + this.pageNo);
      this.getReserves();
    }
    if (event.key === 'ArrowUp') {
      // scroll up
      if (this.highLightRow > 0) {
        this.highLightRow--;
        document.getElementById('row' + this.highLightRow).focus();
        console.log('highLightRow = ' + this.highLightRow);
      }
    }
    if (event.key === 'ArrowDown') {
      // scroll down

      if (this.highLightRow + 1 < this.numberRows) {
        this.highLightRow++;
        console.log('Arrow down highLightRow = ' + this.highLightRow);
      }
    }
  }

  getAmount(reserve: Reserve, i: number) {
    if (!reserve.reserveEntries[i]) {
      return 0;
    }
    const amount = reserve.reserveEntries[i].amount;
    return reserve.reserveEntries[i].amount;
  }

  getSubtotal(reserve: Reserve, i: number) {
    if (!reserve.reserveEntries[i]) {
      console.log('i = ' + i);
      return 0;
    }

    const amount = reserve.reserveEntries[i].subtotal;
    return amount;
  }

  getDescriptionType(desc: string) {
    const index = desc.indexOf(':');
    const type = desc.substring(0, index);
    return type;
  }

  getDescriptionLabel(desc: string) {
    const index = desc.indexOf(':');
    const label = desc.substring(index + 2);
    return label;
  }

  onHighLightRow(index: number) {
    console.log('highlight row = ' + index);
    this.highLightRow = index;
  }

  isHighLightRow(index: number, colNo: number) {
    if (index !== 999 && index === this.highLightRow) {
      if (colNo === this.colNo) {
        console.log('colNo = ', colNo + ' highLightCell');
        // document.getElementById('row' + index).focus();
        return 'highLightCell';
      } else {
        // console.log('row =', index);
        // console.log('colNo = ', colNo + ' highLightRow');

        return 'highLightRow';
      }
    } else {
      return '';
    }
  }

  isHighLightSubtotal(index: number, colNo: number) {
    if (index !== 999 && index === this.highLightRow) {
      if (colNo === this.colNo) {
        // console.log('colNo = ', colNo);
        return 'subtotalHighlight';
      } else {
        // console.log('row =', index);
        return 'subtotal';
      }
    } else {
      return '';
    }
  }

  onOpenAddReserveFromFile(reserveType: string) {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { myTitle: reserveType, myType: reserveType };
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.position = {
      top: '20px',
      left: '200px'
    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '60%';
    dialogConfig.minWidth = '60%';
    dialogConfig.maxWidth = '100%';
    dialogConfig.height = '800px';
    dialogConfig.maxHeight = '90vh',  // Maximum height (prevents overflow on small screens)
    dialogConfig.minHeight = '90vh'  // Minimum height

    const fileNameDialogRef = this.fileNameDialog.open(GetFileNameDialog, dialogConfig);
    

    fileNameDialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      const fileSelect: FileSelect = result.fileSelect;
      this.reserveObj$ = this.reserveService.getReserveFromFile(fileSelect, reserveType);
      this.getReserves();
      
    });
  }

  OpenDeleteConfirmation(reserve: Reserve) {

    console.log('ReserveListComponent.openDeleteConfirmation');
    
        let dialogConfig = new MatDialogConfig();
        dialogConfig.panelClass = 'custom-dialog-container';
        dialogConfig.data = {
          deleteType: 'reserve',
          id: reserve.reserveId,
          label: reserve.description,
          deleted: false,
        };
    
        dialogConfig.disableClose = true;
        dialogConfig.width = '20%';
        dialogConfig.minWidth = '80%';
    
        const dialogRef = this.deleteConfirmationDialog.open(DeleteConfirmationComponent, dialogConfig);
    
        dialogRef.afterClosed().subscribe((result) => {
          console.log('Dialog result:', result);
          this.isDelete = result.delete;
          this.reserveObj$ = this.reserveService.fetchReserves('' + this.pageNo);
          this.getReserves();
        });
    

    
  }

  OpenDeleteByOldestYear() {

    console.log('ReserveListComponent.OpenDeleteByOldestYear');
    
        let dialogConfig = new MatDialogConfig();
        dialogConfig.panelClass = 'custom-dialog-container';
        dialogConfig.data = {
          deleteType: 'OldestReserves',
          id: 0,
          label: 'OldestReserves',
          deleted: false,
        };
    
        dialogConfig.disableClose = true;
        dialogConfig.width = '20%';
        dialogConfig.minWidth = '80%';
    
        const dialogRef = this.deleteConfirmationDialog.open(DeleteConfirmationComponent, dialogConfig);
    
        dialogRef.afterClosed().subscribe((result) => {
          console.log('Dialog result:', result);
          this.isDelete = result.delete;
          this.reserveObj$ = this.reserveService.fetchReserves('' + this.pageNo);
          this.getReserves();
        });
    

    
  }

  onOpenAddReserve() {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'hide-scrollbar-dialog';
    dialogConfig.position = {
      top: '10px',
    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '90%';
    dialogConfig.minWidth = '90%';
    dialogConfig.height = '80vh';
    dialogConfig.position = {
      top: '30px',
      left: '350px',
    };
    const dialogRef = this.fileNameDialog.open(AddReserveDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.reserveObj$ = this.reserveService.fetchReserves('0');
      this.getReserves();
    });
  }

  openEditTotals() {

        let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { reserveTotals: this.reserveTotals };
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.position = {
      top: '50px',
      left: '500px'
    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '25%';
    dialogConfig.minWidth = '25%';
    
    dialogConfig.height = '30px';
    dialogConfig.maxHeight = '30vh',  // Maximum height (prevents overflow on small screens)
    dialogConfig.minHeight = '30vh'  // Minimum height

    const editReserveDialogRef = this.editReserveTotalsDialog.open(EditReserveTotals, dialogConfig);
    

    editReserveDialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.reserveTotals = result.reserveTotals;
      this.reserveService.updateReserveTotals(this.reserveTotals).subscribe({
        next: (resData) => {
          console.log(resData);
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
    });



  }

  onClickShowRunningBalance(category: Category) {}

  OnClickeDisplayCategoryExpensesByMonth(categoryId, selectType, year, month, closeLink) {
    // this.router.navigate(['/displayCategoryExpensesByMonth',
    // categoryId, selectType, year, month, closeLink ]);
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
}
