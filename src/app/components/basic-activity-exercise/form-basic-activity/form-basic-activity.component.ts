import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicActivityExerciseService } from '../../basic-activity-exercise.service';

import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatDialogModule, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-form-basic-activity',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './form-basic-activity.component.html',
  styleUrl: './form-basic-activity.component.css'
})
export class FormBasicActivityComponent {
  basicExerciseService = inject(BasicActivityExerciseService)

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }

  insertBaseActivityForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required]
    }),
    description: new FormControl(''),
    cal: new FormControl('',{
      validators: [Validators.required]
    })
  })

  async insertActivity(){
    try{
      if(this.insertBaseActivityForm.valid){
        const activity = {
          name: this.insertBaseActivityForm.value.name!,
          description: this.insertBaseActivityForm.value.description!,
          cal: +this.insertBaseActivityForm.value.cal!,
        }
        await this.basicExerciseService.addBasicActivity(activity)
        this.closeDialog()        
      }
    } catch(error){
      console.error(error)
    }
  }


}
