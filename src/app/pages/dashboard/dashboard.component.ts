import { Component, inject, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FormActivityComponent } from '../../components/activity/form-activity/form-activity.component';
import { ActivityService } from '../../components/activity.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { AuthService } from '../../shared/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  readonly dialog = inject(MatDialog);

  activityService = inject(ActivityService)
  authService = inject(AuthService)

  async ngOnInit() {
    this.activityService.fetchActivities()
  }

  openDialog() {
    this.dialog.open(FormActivityComponent);
  }

  onUpdateQuantity(e: number, index: number){
    let newVal = {
      quantity: this.activityService.loadedActivities()[index].quantity,
    }
    if(e === 1){
      newVal.quantity++
    } else if(e === 0){
      newVal.quantity--
    }

    if(newVal.quantity > 0){
      this.activityService.updateActivity(newVal, this.activityService.loadedActivities()[index].id)
    } else{
      this.activityService.deleteExercises(this.activityService.loadedActivities()[index].id)
    }
    
    
  }
}
