import { Component } from '@angular/core';
import { ExercisesComponent } from "../../components/exercises/exercises.component";

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [ExercisesComponent],
  templateUrl: './exercises-page.component.html',
  styleUrl: './exercises-page.component.css'
})
export class ExercisesPageComponent {

}
