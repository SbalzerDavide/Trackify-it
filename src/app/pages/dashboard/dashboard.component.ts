import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { FormActivityComponent } from '../../components/activity/form-activity/form-activity.component';
import { ActivityService } from '../../components/activity.service';
import { CardComponent } from "../../shared/lib/card/card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  data = signal<any[]>([])

  readonly dialog = inject(MatDialog);

  activityService = inject(ActivityService)

  loadedActivities = computed(()=>{
    return this.activityService.getGroupingActivity(this.data()) 
  })

  async ngOnInit() {
    await this.fetchData()
  }

  openDialog() {
    this.dialog.open(FormActivityComponent);
  }

  private async fetchData(){
    const data = await this.activityService.fetchRangeActivities(new Date(), new Date())
    this.data.set(data)
  }

  async onUpdateQuantity(e: number, index: number){
    const realElementToUpdate = this.data().find(el => el.exercise_id === this.loadedActivities()[index].exercise_id && el.date  === this.loadedActivities()[index].date)

    let newVal = {
      quantity: realElementToUpdate.quantity,
    }
    if(e === 1){
      newVal.quantity++
    } else if(e === 0){
      newVal.quantity--
    }

    if(newVal.quantity > 0){
      await this.activityService.updateActivity(newVal, realElementToUpdate.id)
    } else{
      await this.activityService.deleteActivity(realElementToUpdate.id)
    }
    await this.fetchData()
  }
}
