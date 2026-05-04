import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReserveTotals } from '../../models/reserve-totals.model';

@Component({
  selector: 'app-edit-reserve-totals',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDialogContent,
    MatLabel,
    MatInputModule,
    MatDialogModule,
    MatButton,
  ],
  templateUrl: './edit-reserve-totals.html',
  styleUrl: './edit-reserve-totals.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReserveTotals implements OnInit {

  title: string;
  errorMessage: string;
  editMessage: string;

  isLoading = false;
  isError = false;

  private fb = new FormBuilder();
  editForm: FormGroup;

  reserveTotals: ReserveTotals;

  numberOfTicks = 0;

  constructor(
    public dialogRef: MatDialogRef<EditReserveTotals>,
    private alertDialog: MatDialog,
    private ref: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      reserveTotals: ReserveTotals;
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
    
    this.isLoading = true;

    this.reserveTotals = this.data.reserveTotals;

    this.initForm();
  }

    initForm() {

    this.editForm = this.fb.group({
      quickenTotal: new FormControl(this.reserveTotals.quickenTotal, [
        Validators.required,
        Validators.max(100000),
      ]),
      cmaTotal: new FormControl(this.reserveTotals.cmaTotal, [
        Validators.required,
        Validators.max(100000)])
    });
  }

  onSubmit() {

    console.log('EditReserveTotal.onSubmit');

    this.reserveTotals.quickenTotal = this.editForm.value.quickenTotal;
    this.reserveTotals.cmaTotal = this.editForm.value.cmaTotal;
    const dataToReturn = { reserveTotals: this.reserveTotals, editMessage: this.editMessage };
    this.dialogRef?.close(dataToReturn);
      

  }
onClose() {


      this.dialogRef?.close();
  }

}
