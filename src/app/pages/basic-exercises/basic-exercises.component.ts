import { Component } from '@angular/core';
import { BasicActivityExerciseComponent } from "../../components/basic-activity-exercise/basic-activity-exercise.component";

@Component({
  selector: 'app-basic-exercises',
  standalone: true,
  imports: [BasicActivityExerciseComponent],
  templateUrl: './basic-exercises.component.html',
  styleUrl: './basic-exercises.component.css'
})
export class BasicExercisesComponent {

}
