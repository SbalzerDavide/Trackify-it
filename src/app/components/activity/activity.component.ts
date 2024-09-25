import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';


import { ActivityService } from '../activity.service';
import { AuthService } from '../../shared/auth/auth.service';
import { CardComponent } from '../../shared/lib/card/card.component';


@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [MatButtonModule, CardComponent, MatButtonToggleModule, MatIconModule, DatePipe],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent {
  activityService = inject(ActivityService)
  authService = inject(AuthService)

  rangeType = signal<'day' | 'week' | 'month' | 'year'>('day')
  startRange = signal<Date>(new Date())
  endRange = signal<Date>(new Date())

  dateFormat = computed(()=>{
    switch (this.rangeType()) {
      case 'day':
        return 'EEEE, MMMM d'
      case 'week':
        return 'd MMMM'
      case 'month':
        return 'd MMMM'
      case 'year':
       return 'd MMMM y'
      default:
        return 'EEEE, MMMM d'
    }
    
  })

  isSameDay = computed(()=>{
    if(this.startRange().getFullYear() === this.endRange().getFullYear() &&
      this.startRange().getMonth() === this.endRange().getMonth() &&
      this.startRange().getDate() === this.endRange().getDate()){
        return true;
    } else{
      return false
    }
  })
  
  async ngOnInit() {
    this.activityService.fetchActivities()
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

  changeSel(e: MatButtonToggleChange){
    this.rangeType.set(e.value)
  }
}
