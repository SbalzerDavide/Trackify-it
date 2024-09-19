import { Component, computed, inject, OnInit } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicActivityExerciseService } from '../basic-activity-exercise.service';

import { ExercisesService } from '../exercises.service';
import { CardComponent } from "../../shared/lib/card/card.component";

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent implements OnInit{
  exerciseService = inject(ExercisesService)
  basicActivityService = inject(BasicActivityExerciseService)

  async ngOnInit() {
    await this.exerciseService.fetchExercises()
    await this.basicActivityService.fetchBasicActivities()
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

  insertExercise(){
    if(this.insertExerciseForm.valid){
      this.exerciseService.addExercises({
        number_of_repetitions: this.insertExerciseForm.value.repetitions,
        basic_exercise_id: this.insertExerciseForm.value.basicExercise,        
      })
    }
    
  }
}
