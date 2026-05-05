import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { Planner } from '../../models/planner.model';
import { PlannerDetails } from '../../models/planner-details.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PlannerService } from '../../services/planner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PlannerDetailEditDialog } from '../planner-detail-edit-dialog/planner-detail-edit-dialog';
import { PlannerEditDialog } from '../planner-edit-dialog/planner-edit-dialog';

@Component({
  selector: 'app-planner-component',
  imports: [MatTableModule, MatButton, LoadingSpinnerComponent, CurrencyPipe],
  templateUrl: './planner-component.html',
  styleUrl: './planner-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnInit {
  plannerService = inject(PlannerService);
  plannerObj$: Observable<Planner[]>;
  planner: Planner;
  planners: Planner[];
  pd: PlannerDetails;

  plannerId: number;
  currentYear: number;

  isLoading = false;
  isDelete = false;

  dataSource = new MatTableDataSource<Planner>([]);
  trackBy = (index: number, el: Planner) => el.plannerId;

  displayedColumns: string[] = [
    'actEst',
    'age',
    'year',
    'presentValue',
    'investment',
    'pension',
    'paulSS',
    'naomiSS',
    'totalIncome',
    'budget',
    'invInc',
    'grossInc',
    'incoNeeded',
    'incTax',
    'neededFromInv',
    'invNetIn',
    'bigExp',
    'bigExpDescr',
  ];

  highLightRow = 999;
  numberRows = 0;
  selectedRow: Planner;

  colNo = 999;
  numberOfCols = 0


  numberOfTicks = 0;

  constructor(
    private ref: ChangeDetectorRef,
    private plannerDetailDialog: MatDialog,
    private alertDialog: MatDialog,
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
    console.log('PlannerComponenet.ngOnint()');
    this.isLoading = true;

    this.planners = new Array();
    this.isLoading = true;

    this.getPlanners();
    this.getPlannerDetails();
  }

  getPlanners() {
    console.log('PlannersComponent.getPlanners');
    this.plannerService.fetchPlanners().subscribe({
      next: (planners: Planner[]) => {
        console.log('in PlannersComponent.getPlanners in subscribe');
        this.planners = planners;
        this.dataSource.data = this.planners;

        this.highLightRow = 999;
        this.numberRows = this.planners.length;
        this.numberOfCols = 18; // As of now

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

  getPlannerDetails() {
    const pdString = localStorage.getItem('pd');
    if (pdString) {
      this.pd = JSON.parse(pdString);
      return;
    }
    this.plannerService.fetchPlannerDetails().subscribe({
      next: (plannerDetails: PlannerDetails) => {
        console.log('in PlannersComponent.getPlannerDetails.subscribe');
        this.pd = plannerDetails;
        localStorage.setItem('pd', JSON.stringify(this.pd));
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

  openEditPlannerDetail() {
    let dialogConfig = new MatDialogConfig();

    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = { plannerDetails: this.pd };
    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.alertDialog.open(PlannerDetailEditDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
    });
  }

  getActual(actual: boolean) {
    if (actual) {
      return 'Actual';
    } else {
      return 'Estimate';
    }
  }

  getTDStyle(year: number) {
    if (year === this.currentYear) {
      return 'currentyear';
    } else {
      return 'regularyear';
    }
  }

  onReestimate() {}

  openEditPlanner(planner: Planner) {
    let dialogConfig = new MatDialogConfig();

    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = { planner: planner };
    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.alertDialog.open(PlannerEditDialog, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      if (result.editMessage) {
        this.openAlertMessageModal(result.editMessage, false);
      }
      console.log('Dialog result after generateAlert', result);
    });
  }

  @HostListener('document:keyup', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    
    if (event.key === 'ArrowRight') {
      // scroll right
    if (this.colNo < this.numberOfCols) {
        this.colNo++;
        return;
      } else if (this.colNo == 0) {
        return;
      }
    }
    
    if (event.key === 'ArrowUp') {
      // scroll up
      if (this.highLightRow > 0) {
        this.highLightRow--;
        this.selectedRow = this.planners[this.highLightRow];
        console.log('highLightRow = ' + this.highLightRow);
      }
    }
    if (event.key === 'ArrowDown') {
      // scroll down

      if (this.highLightRow + 1 < this.numberRows) {
        this.highLightRow++;
        console.log('Arrow down highLightRow = ' + this.highLightRow);
        this.selectedRow = this.planners[this.highLightRow];
      }
    }
  }

  onHighLightRow(index: number) {
    console.log('highlight row = ' + index);
    this.highLightRow = index;
  }

   highlight(row: any, index: number) {
    console.log('Planner Component.highlightrow: ' + row);
    // Toggles selection: if same row is clicked again, it clears the highlight
    this.selectedRow = this.selectedRow === row ? null : row;
    this.highLightRow = index; 
    this.colNo = 0;
    console.log('Planner Component.selectedRow: ' + this.selectedRow);
  }

  isHighLightRow(index: number, colNo: number) {
    if (colNo !== 999 && index === this.highLightRow) {
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
