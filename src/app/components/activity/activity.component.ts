import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { ActivityService } from '../activity.service';
import { AuthService } from '../../shared/auth/auth.service';
import { CardComponent } from '../../shared/lib/card/card.component';
// import { ActivityStore } from '../activity.store';


@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [MatButtonModule, CardComponent, MatButtonToggleModule, MatIconModule, DatePipe, MatProgressSpinnerModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent {
  activityService = inject(ActivityService)
  authService = inject(AuthService)

  // store = inject(ActivityStore)

  rangeType = signal<'day' | 'week' | 'month' | 'year'>('day')

  loading = signal<boolean>(true)

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
    }
    
  })

  isSameDay = computed(()=>{
    if(this.activityService.startRange().getFullYear() === this.activityService.endRange().getFullYear() &&
      this.activityService.startRange().getMonth() === this.activityService.endRange().getMonth() &&
      this.activityService.startRange().getDate() === this.activityService.endRange().getDate()){
        return true;
    } else{
      return false
    }
  })
  
  async ngOnInit() {
    await this.activityService.fetchActivities()
    this.loading.set(false)      
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
    this.activityService.endRange.set(new Date())

    this.rangeType.set(e.value)

    switch (this.rangeType()) {
      case 'day':        
        this.activityService.startRange.set(new Date())
        break;
      case 'week':
        this.activityService.startRange.set(this.changeDay(this.activityService.endRange(), -7))
        break;
      case 'month':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -1))
        break;
      case 'year':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -12))
        break;
    }
    this.activityService.fetchActivities()  

  }

  changeDay(date: Date, daysToAdd: number) {
    let newDate = new Date(date);

    newDate.setDate(newDate.getDate() + daysToAdd);

    return newDate;
  }

  changeMonth(date: Date, monthToAdd: number) {
    let newDate = new Date(date);

    newDate.setMonth(newDate.getMonth() + monthToAdd);

    return newDate;
  }

  goBefore(){
    switch (this.rangeType()) {
      case 'day':        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), -1))
        break;
      case 'week':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -7))
        this.activityService.endRange.set(this.changeDay(this.activityService.startRange(), -7))
        break;
      case 'month':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -1))
        this.activityService.endRange.set(this.changeMonth(this.activityService.startRange(), -1))
        break;
      case 'year':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.startRange(), -12))
        break;
      }
    this.activityService.fetchActivities()  

  }

  goAfter(){
    switch (this.rangeType()) {
      case 'day':
        console.log("day");
        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), 1))
        break;
      case 'week':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 7))
        this.activityService.endRange.set(this.changeDay(this.activityService.startRange(), 7))
        break;
      case 'month':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 1))
        this.activityService.endRange.set(this.changeMonth(this.activityService.startRange(), 1))
        break;
      case 'year':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.startRange(), 12))
        break;
    }
    this.activityService.fetchActivities()  
  }

  setCardTitle(basicExercise: {
      number_of_repetitions: string,
      basic_activity_exercise: {
        cal: string, 
        name: string
      }
    }){
      return `${basicExercise.number_of_repetitions} x ${basicExercise.basic_activity_exercise.name}`
  }
}
