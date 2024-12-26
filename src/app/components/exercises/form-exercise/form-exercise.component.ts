import { Component, computed, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button';


import { ExercisesService } from '../../exercises.service';
import { BasicEntitiesService } from '../../basic-entities.service';
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
  basicEntitiesService = inject(BasicEntitiesService)

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>) { }

  async ngOnInit() {
    await this.basicEntitiesService.fetchBasicActivities()
  }

  closeDialog() {
    this.dialogRef.close();
  }

  basicActivities = computed(()=>{    
    return this.basicEntitiesService.loadedBasicActivities().map((el)=>{
      return {
        value: el.id,
        label: el.name
      }
    })
  })

  insertExerciseForm = new FormGroup({
    basicEntity: new FormControl(''),
    name: new FormControl(''),
    repetitions: new FormControl('', {
      validators: [Validators.required, Validators.min(1)]
    }),
  }, { validators: this.oneFieldOnlyValidator('basicEntity', 'name') })

  async insertExercise(){
    if(this.insertExerciseForm.valid){
      try{      
        if(this.insertExerciseForm.valid){
          const newExercise: {
            number_of_repetitions: string;
            name?: string;
            basic_exercise_id?: string;
          } = {
            number_of_repetitions: this.insertExerciseForm.value.repetitions!,
          }
          if(this.insertExerciseForm.value.basicEntity){
            newExercise.basic_exercise_id = this.insertExerciseForm.value.basicEntity
          } else if(this.insertExerciseForm.value.name){
            newExercise.name = this.insertExerciseForm.value.name
          }
          await this.exerciseService.addExercises(newExercise)
          this.exerciseService.fetchExercises()
          this.closeDialog()        
        }
      } catch(error){
        console.error(error)
      }
    }
  }

  oneFieldOnlyValidator(field1: string, field2: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const field1Value = group.get(field1)?.value;
      const field2Value = group.get(field2)?.value;
  
      if ((field1Value && field2Value) || (!field1Value && !field2Value)) {
        return { oneFieldOnly: true }; // Errore se entrambi o nessuno dei due sono popolati
      }
  
      return null; // Valido
    };
  }

}
