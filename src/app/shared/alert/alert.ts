import { ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnInit, output, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-alert',
  imports: [MatDialogContent, MatDialogActions, MatButton],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert implements OnInit{

  message: string;
  isError: boolean = false;
  errorColor = 'red';
  alertColor = 'rgb(220, 138, 176);';
  backgroundColor = '';
  textColor = 'black';

 constructor(
    public dialogRef: MatDialogRef<Alert>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { message: string, isError: boolean }
  ) {}

  ngOnInit(): void {
    console.log('Alert Component: ');
    this.message = this.data.message;
    if (this.data.isError) {
      this.isError = true;
      this.backgroundColor = 'rgb(228, 22, 118)';
      this.textColor = 'white';
    } else {
      this.backgroundColor = 'rgb(220, 138, 176)';
      //  this.backgroundColor = 'blue';
    }
  }



  onClose() {
    const dataToReturn = { isError: this.isError };
    this.dialogRef?.close(dataToReturn);
  }

}
