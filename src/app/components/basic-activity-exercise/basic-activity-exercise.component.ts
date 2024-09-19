import { Component, inject, OnInit } from '@angular/core';
import { BasicActivityExerciseService } from '../basic-activity-exercise.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { FormBasicActivityComponent } from "./form-basic-activity/form-basic-activity.component";

import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-basic-activity-exercise',
  standalone: true,
  imports: [ CardComponent, FormBasicActivityComponent, MatButtonModule],
  templateUrl: './basic-activity-exercise.component.html',
  styleUrl: './basic-activity-exercise.component.css'
})
export class BasicActivityExerciseComponent implements OnInit {
  basicExerciseService = inject(BasicActivityExerciseService)

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {    
    this.basicExerciseService.fetchBasicActivities()
  }

  openDialog() {
    this.dialog.open(FormBasicActivityComponent);
  }
}
