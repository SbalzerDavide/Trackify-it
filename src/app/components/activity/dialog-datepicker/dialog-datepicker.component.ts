import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';


export interface DialogData {
  selectedDate: Date,
  animal: string
}

@Component({
  selector: 'app-dialog-datepicker',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatDatepickerModule, MatDialogModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog-datepicker.component.html',
  styleUrl: './dialog-datepicker.component.css'
})
export class DialogDatepickerComponent {

  constructor(public dialogRef: MatDialogRef<DialogDatepickerComponent>){}

  change(date: Date){    
    this.dialogRef.close(date);
  }

}
