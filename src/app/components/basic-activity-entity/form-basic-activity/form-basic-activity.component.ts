import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicEntitiesService } from '../../basic-entities.service';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-form-basic-activity',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  templateUrl: './form-basic-activity.component.html',
  styleUrl: './form-basic-activity.component.css'
})
export class FormBasicActivityComponent {
  basicEntitiesService = inject(BasicEntitiesService)

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }

  insertBaseActivityForm = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required]
    }),
    description: new FormControl(''),
    unit: new FormControl('',{
      validators: [Validators.required]
    })
  })

  async insertActivity(){
    try{
      if(this.insertBaseActivityForm.valid){
        const activity = {
          name: this.insertBaseActivityForm.value.name!,
          description: this.insertBaseActivityForm.value.description!,
          unit: +this.insertBaseActivityForm.value.unit!,
        }
        await this.basicEntitiesService.addBasicActivity(activity)
        this.basicEntitiesService.fetchBasicActivities()
        this.closeDialog()        
      }
    } catch(error){
      console.error(error)
    }
  }


}
