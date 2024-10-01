import { Component } from '@angular/core';
import { GoalComponent } from "../../components/activity/goal/goal.component";

@Component({
  selector: 'app-goal-page',
  standalone: true,
  imports: [GoalComponent],
  templateUrl: './goal-page.component.html',
  styleUrl: './goal-page.component.css'
})
export class GoalPageComponent {

}
