import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ExercisesService } from '../exercises.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { FormExerciseComponent } from './form-exercise/form-exercise.component';


@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [MatButtonModule, CardComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent implements OnInit{
  exerciseService = inject(ExercisesService)

  readonly dialog = inject(MatDialog);

  async ngOnInit() {
    await this.exerciseService.fetchExercises()
  }

  openDialog() {
    this.dialog.open(FormExerciseComponent);
  }

}
