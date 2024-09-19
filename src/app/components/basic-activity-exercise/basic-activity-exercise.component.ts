import { Component, inject, OnInit } from '@angular/core';
import { BasicActivityExerciseService } from '../basic-activity-exercise.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from "../../shared/lib/card/card.component";
import { FormBasicActivityComponent } from "./form-basic-activity/form-basic-activity.component";

import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../shared/lib/dialog/dialog.component';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-basic-activity-exercise',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, FormBasicActivityComponent, MatButtonModule, MatGridListModule],
  templateUrl: './basic-activity-exercise.component.html',
  styleUrl: './basic-activity-exercise.component.css'
})
export class BasicActivityExerciseComponent implements OnInit {
  basicExerciseService = inject(BasicActivityExerciseService)

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {    
    this.basicExerciseService.fetchBasicActivities()
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

  insertActivity(){
    if(this.insertBaseActivityForm.valid){
      const activity = {
        name: this.insertBaseActivityForm.value.name!,
        description: this.insertBaseActivityForm.value.description!,
        cal: +this.insertBaseActivityForm.value.cal!,
      }

      this.basicExerciseService.addBasicActivity(activity)
    }
  }

  openDialog() {
    this.dialog.open(FormBasicActivityComponent);
  }
}
