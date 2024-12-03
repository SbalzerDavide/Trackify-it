import { Component, computed, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button';


import { ExercisesService } from '../../exercises.service';
import { BasicActivityExerciseService } from '../../basic-activity-exercise.service';
import { FormBasicActivityComponent } from '../../basic-activity-exercise/form-basic-activity/form-basic-activity.component';

@Component({
  selector: 'app-form-exercise',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatDialogModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './form-exercise.component.html',
  styleUrl: './form-exercise.component.css'
})
export class FormExerciseComponent implements OnInit{
  exerciseService = inject(ExercisesService)
  basicActivityService = inject(BasicActivityExerciseService)

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>) { }

  async ngOnInit() {
    await this.basicActivityService.fetchBasicActivities()
  }

  closeDialog() {
    this.dialogRef.close();
  }

  basicActivities = computed(()=>{    
    return this.basicActivityService.loadedBasicActivities().map((el)=>{
      return {
        value: el.id,
        label: el.name
      }
    })
  })

  insertExerciseForm = new FormGroup({
    basicExercise: new FormControl('', {
      validators: [Validators.required]
    }),
    repetitions: new FormControl('', {
      validators: [Validators.required, Validators.min(1)]
    })
  })

  async insertExercise(){
    try{      
      if(this.insertExerciseForm.valid){
        await this.exerciseService.addExercises({
          number_of_repetitions: this.insertExerciseForm.value.repetitions,
          basic_exercise_id: this.insertExerciseForm.value.basicExercise,        
        })
        this.exerciseService.fetchExercises()
        this.closeDialog()        
      }
    } catch(error){
      console.error(error)
    }
    
  }

}
