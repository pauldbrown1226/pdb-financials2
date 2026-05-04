import { EventEmitter, Injectable, Output, signal } from '@angular/core';
import { EditData } from './edit-data.model';



@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private editData = signal<EditData>({ isEdit: false , editMessage: ''});
  readonly sharedAlert = this.editData.asReadonly(); // Expose a readonly version

  private closeAlert = signal(true);
  readonly sharedCloseAlert = this.editData.asReadonly(); // Expose a readonly version

  generateAlert(editMessage: string) {
      
     const editData = {
            isEdit: true,
            editMessage:editMessage
     }
    this.editData.set(editData); // Update the signal's value
  }

  closeAlertBox() {
    console.log('alertService.CloseAlertBox');

      const editData = {
      isEdit: false,
      editMessage: 'closing error alerterror generated from categories component',
    };
    this.editData.set(editData);
  }
}
