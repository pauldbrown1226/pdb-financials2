import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  
} from '@angular/material/dialog';

import { HttpErrorResponse } from '@angular/common/http';
import { MatButton } from '@angular/material/button';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/category-model';
import { ReportsService } from '../../services/reports-service';
import { BudgetService } from '../../services/budget.service';
import { ReserveService } from '../../services/reserve.service';

export interface DeleteData {
  type: string;
  id: string;
}

@Component({
  selector: 'app-delete-confirmation-component',
  imports: [MatDialogActions, MatDialogContent, MatButton],
  templateUrl: './delete-confirmation-component.html',
  styleUrl: './delete-confirmation-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteConfirmationComponent implements OnInit {
  categoryService = inject(CategoryService);
  reportService = inject(ReportsService);
  budgetService = inject(BudgetService);
  reserveService = inject(ReserveService);

  errorMessage: string;
  editMessage: string;

  id: number;
  label: string;
  year: number;
  deleteType: string;
  deleted: boolean = false;
  isError: boolean = false;
  title: string;

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { deleteType: string, id: number; label: string, deleted: boolean },
    private ref: ChangeDetectorRef)
   {


    // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck(); //
    }, 1000);
  }

  ngOnInit(): void {
    console.log('DeleteConfirmationComponent.ngOnInit');
    console.log('data: ' + this.data);

    this.id = this.data.id;
    this.deleted = this.data.deleted;
    this.deleteType = this.data.deleteType;
    this.label = this.data.label;
    if (this.deleteType === 'category') {
      this.title = 'Do you really want to delete this category: ' + this.label;
    } else if (this.deleteType === 'report') {
      this.title = 'Do you really want to delete this report: ' + this.label;
    } else if (this.deleteType === 'budget') {
      this.title = 'Do you really want to delete this budget: ' + this.label;
    } else if (this.deleteType === 'reserve') {
      this.title = 'Do you really want to delete this reserve: ' + this.label;
    } else if (this.deleteType === 'OldestReserves') {
      this.reserveService.findOldestYear().subscribe({
        next:(year: number) => {
        this.year = year;
        this.title = 'Do you really want to delete all the reserves for year : ' + year;    
        },
      })
    }




  }
  confirm() {
    console.log('delete-confirmation.confirm');

    if (this.deleteType === 'category') {
      this.deleteCategory(this.id);
    } else if (this.deleteType === 'report') {
      this.deleteReport(this.id);
    } else if (this.deleteType === 'budget') {
      this.deleteBudget(this.id);
    } else if (this.deleteType === 'reserve') {
      this.deleteReserve(this.id);
    } else if (this.deleteType === 'OldestReserves')
      this.deleteReservesByOldestYear();
    


  }

  deleteCategory(index: number) {

    this.categoryService.deleteCategory(this.id).subscribe({

      next: (resData: any) => {
            
            localStorage.removeItem('category');
            this.title = this.label + ' has been deleted';
            this.deleted = true;
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;        } else {
          message = errorMessage.message;
        }
        this.title = message;
        console.log('deletConfirmation Error: ' + this.title);
        this.isError = true;
      },

    });

  }

  deleteReport(index: number) {

    this.reportService.deleteReport(this.id).subscribe({

      next: (resData: any) => {
            
            localStorage.removeItem('report');
            this.title = this.label + ' has been deleted';
            this.deleted = true;
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;        } else {
          message = errorMessage.message;
        }
        this.title = message;
        console.log('deletConfirmation Error: ' + this.title);
        this.isError = true;
      },

    });

  }

    deleteBudget(index: number) {

    this.budgetService.deleteBudget(this.id).subscribe({

      next: (resData: any) => {
            
            localStorage.removeItem('budget');
            this.title = this.label + ' has been deleted';
            this.deleted = true;
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;        } else {
          message = errorMessage.message;
        }
        this.title = message;
        console.log('deletConfirmation Error: ' + this.title);
        this.isError = true;
      },

    });

  }

  deleteReserve(index: number) {

    this.reserveService.deleteReserve(this.id).subscribe({

      next: (resData: any) => {
            
            localStorage.removeItem('reserve');
            this.title = this.label + ' has been deleted';
            this.deleted = true;
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;        } else {
          message = errorMessage.message;
        }
        this.title = message;
        console.log('deletConfirmation Error: ' + this.title);
        this.isError = true;
      },

    });

  }
 
  deleteReservesByOldestYear() {
    this.reserveService.deleteReservesByOldestYear().subscribe({

          next: (resData: any) => {
            
            localStorage.removeItem('reserve');
            this.title = 'reserve records for year ' + this.year + ' have been deleted';
            this.deleted = true;
      },

      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;        } else {
          message = errorMessage.message;
        }
        this.title = message;
        console.log('deletConfirmation Error: ' + this.title);
        this.isError = true;
      },

    });


  }

  closeModal() {
    const dataToReturn = { deleteBook: false };
    this.dialogRef?.close(dataToReturn);
  }
}
