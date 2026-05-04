import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Category } from '../../models/category-model';
import { CategoryService } from '../../services/category-service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { RouterLink } from '@angular/router';
import { Alert } from '../../shared/alert/alert';
import { EditCategoryComponent } from '../category-edit-component/category-edit-component';
import { DeleteConfirmationComponent } from '../../shared/delete-confirmation-component/delete-confirmation-component';
import { MatButton, MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categories-component',
  imports: [MatTableModule, MatPaginatorModule, MatButton, LoadingSpinnerComponent, MatButtonModule,],
  templateUrl: './categories-list-component.html',
  styleUrl: './categories-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent implements OnInit {
  categoryService = inject(CategoryService);

  category: Category;
  categories: Category[] = [];

  editMode = false;
  isLoading = false;
  isDelete = false

  dataSource = new MatTableDataSource<Category>([]);
  trackBy = (index: number, el: Category) => el.label;

  totalElements = 0;
  pageSize = 10;

  displayedColumns: string[] = [
    'label',
    'name',
    'type',
    'subType',
    'catOrder',
    'reserve',
    'budget',
    'delete',
  ];

  numberOfTicks = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private ref: ChangeDetectorRef,
    private alertDialog: MatDialog,
    private categoryEditDialog: MatDialog,
    private deleteConfirmationDialog: MatDialog,
  ) {
    // Update data asynchronously
    setInterval(() => {
      this.numberOfTicks++;
      // Manually mark the component for checking during the next change detection cycle
      this.ref.markForCheck();
    }, 1000);
  }

  ngOnInit(): void {
    this.isLoading = true;
    const categoriesString = localStorage.getItem('categories');
    if (!categoriesString) {
      this.getCategories();
    } else {
      this.categories = JSON.parse(categoriesString);
      this.dataSource.data = this.categories;
      this.isLoading = false;
    }
  }

  getCategories() {
    this.categoryService.getCatgories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
        this.dataSource.data = this.categories;
        localStorage.setItem('categories', JSON.stringify(this.categories));
        this.totalElements = this.categories.length;
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

  openEditCategory(mode: string, category: Category) {
    this.category = category;
    console.log('CategoriesComponent.openEditCategory ' + mode + ' ' + category);
    let dialogConfig = new MatDialogConfig();
    dialogConfig.data = { category: this.category, editMode: mode };
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.position = {
      top: '250px',

    };
    dialogConfig.disableClose = true;
    dialogConfig.width = '90%';
    dialogConfig.minWidth = '90%';

    const dialogRef = this.categoryEditDialog.open(EditCategoryComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.categories = result.categories;
      console.log('Dialog result before generateAlert', result);
      if (result.editMessage) {
        this.openAlertMessageModal(result.editMessage, result.isError);
      }
      console.log('Dialog result after generateAlert', result);
      this.onReset();
      return;
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
    console.log('CategoriesList.onReset()');
    this.isLoading = true;
    this.getCategories();
    this.isLoading = false;
  }

   openDeleteConfirmation(category: Category) {
    console.log('CategoryListComponent.openDeleteConfirmation');

    let dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'custom-dialog-container';
    dialogConfig.data = { deleteType: 'category', id: category.categoryId, label:category.label, deleted: false };

    dialogConfig.disableClose = true;
    dialogConfig.width = '20%';
    dialogConfig.minWidth = '80%';

    const dialogRef = this.deleteConfirmationDialog.open(
      DeleteConfirmationComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
      this.isDelete = result.delete;
      this.getCategories();
    });
  }
}
