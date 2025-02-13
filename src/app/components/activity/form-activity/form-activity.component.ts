import { Component, computed, inject, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EntitiesService } from '../../entities.service';
import { ActivityService } from '../../activity.service';
import { FormBasicActivityComponent } from '../../basic-activity-entity/form-basic-activity/form-basic-activity.component';


@Component({
  selector: 'app-form-activity',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatButtonModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './form-activity.component.html',
  styleUrl: './form-activity.component.css'
})
export class FormActivityComponent implements OnInit{

  entitiesService = inject(EntitiesService)
  activityService = inject(ActivityService)

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>){}

  async ngOnInit() {
    await this.entitiesService.fetchEntities()
  }

  entities = computed(()=>{    
    return this.entitiesService.loadedEntities().map((el)=>{
      return {
        value: el.id,
        label: el.basic_entities?.name ?? el.name
      }
    })
  })

  closeDialog() {
    this.dialogRef.close();
  }

  insertActivityForm = new FormGroup({
    day: new FormControl(new Date()),
    entity: new FormControl('', {
      validators: [ Validators.required]
    }),
    quantity: new FormControl('1', {
      validators: [ Validators.required]
    })
  })

  async insertActivity(){
    try{
      if(this.insertActivityForm.valid){
        const activity = {
          date: this.insertActivityForm.value.day,
          entity_id: this.insertActivityForm.value.entity,
          quantity: this.insertActivityForm.value.quantity
        }
        await this.activityService.addActivity(activity)
        this.activityService.updateActivities.next(activity)
        this.closeDialog()        
      }
    } catch(error){
      console.error(error)
    }
  }
}
