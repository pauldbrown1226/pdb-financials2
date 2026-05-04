import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogConfig,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Category } from '../../models/category-model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatFormField,
  MatError,
  MatLabel,
  MatSelectModule,
  MatOption,
} from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { Observable } from 'rxjs';
import { CategoryService } from '../../services/category-service';
import { HttpErrorResponse } from '@angular/common/http';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-edit-category-component',
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatFormField,
    MatError,
    MatLabel,
    MatSelectModule,
    MatDialogActions,
    MatOption,
    MatDialogModule,
    MatButton,
  ],
  templateUrl: './category-edit-component.html',
  styleUrl: './category-edit-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryComponent implements OnInit {
  category: Category;
  editMode = false;
  isLoading = false;

  editMessage: string;

  editForm: FormGroup;
  private fb = new FormBuilder();

  
  categoryService = inject(CategoryService);
  categoryUpdateObj$: Observable<Category>;

  constructor(
    public dialogRef: MatDialogRef<EditCategoryComponent>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { category: Category; editMode: string }
  ) {}

  ngOnInit(): void {
    console.log('categoryEditComponent.ngOnInit');
    console.log(this.data.category);
    this.category = this.data.category as Category;
    if (this.data.editMode === 'edit') {
      this.editMode = true;
      this.category = this.data.category as Category;
    } else {
      this.editMode = false;
      this.category = new Category(0, '', '', '', '', '', false, false );
    }

    this.initForm();
  }

  initForm() {

    if (!this.editMode) {
      this.category.type = 'EXPENSE';
      this.category.subType = 'EXPENSE'; 
      this.category.catOrder = 'SINGLE';
      
    }
    console.log('CategoryEditComponent.initForm()');
    this.editForm = this.fb.group({
      name: new FormControl(this.category.name, [Validators.required, Validators.maxLength(75)]),
      label: new FormControl(this.category.label),
      type: new FormControl(this.category.type),
      subType: new FormControl(this.category.subType),
      catOrder: new FormControl(this.category.catOrder),
      reserve: new FormControl('' + this.category.reserve),
      budget: new FormControl('' + this.category.budget),
    });
    console.log('CategoryEditComponent.initForm return');
  }

  onSubmit() {
    console.log('CategoryEditComponent.onSubmit');

    this.isLoading = true;



     const newCategory: Category = new Category(
      this.category.categoryId,
      this.editForm.value.name,
      this.editForm.value.label,
      this.editForm.value.type,
      this.editForm.value.subType,
      this.editForm.value.catOrder,
      this.editForm.value.reserve,
      this.editForm.value.budget);

    

    if (this.editMode) {
      this.categoryUpdateObj$ = this.categoryService.updateCategory(newCategory);
    } else {
      this.categoryUpdateObj$ = this.categoryService.addCategory(newCategory);
    }

    this.categoryUpdateObj$.subscribe({
      next: (category: Category) => {
        this.category = category;
        if (this.editMode) {
          this.editMessage = 'Category ' + category.name + ' successfully updated.';
        } else {
          this.editMessage = 'Category ' + category.name + ' successfully added.';
        }

        const categoriesString = localStorage.getItem('categories');
        let categories: Category[];
        categories = JSON.parse(categoriesString);
        if (this.editMode) {
          // tslint:disable-next-line: forin
          for (const index in categories) {
            if (categories[index].categoryId === this.category.categoryId) {
              categories[index] = this.category;
              localStorage.setItem('categories', JSON.stringify(categories));
              break;
            }
          }
        } else {
          categories.splice(0, 0, this.category);
          localStorage.setItem('categories', JSON.stringify(categories));
        }

        if (this.editMode) {
          const dataToReturn = { categories: categories, editMessage: this.editMessage };
          this.dialogRef?.close(dataToReturn);
        } else {
          const dataToReturn = { categories: categories, editMessage: this.editMessage, isError: false };
          this.dialogRef?.close(dataToReturn);
        }
      },
      error: (errorMessage: HttpErrorResponse) => {
        let message = '';
        if (errorMessage.error.message) {
          message = errorMessage.error.message;
        } else {
          message = errorMessage.message;
        }
        this.openAlertMessageModal(message,true);


        console.log('categoryEdit.getCategories Error');
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

    if (this.editMode) {
      const dataToReturn = { category: this.category, editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
    } else {
      const dataToReturn = { categorys: [], editMessage: this.editMessage };
      this.dialogRef?.close(dataToReturn);
    }
  }

}
