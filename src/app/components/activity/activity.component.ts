import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


import { ActivityService } from '../activity.service';
import { AuthService } from '../../shared/auth/auth.service';
import { CardComponent } from '../../shared/lib/card/card.component';
import { GoalStore } from '../goal.store';
import { GoalService } from '../goal.service';
import { ChartComponent } from "../../shared/lib/chart/chart.component";
import { toObservable } from '@angular/core/rxjs-interop';
import { FormatDataChartService } from '../format.data.chart.service';
import { ExercisesService } from '../exercises.service';


@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [MatButtonModule, CardComponent, MatButtonToggleModule, MatIconModule, DatePipe, MatProgressSpinnerModule, ChartComponent, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent implements OnInit{
  activityService = inject(ActivityService)
  authService = inject(AuthService)

  goalStore = inject(GoalStore)
  goalService = inject(GoalService)

  formatDataChart = inject(FormatDataChartService)

  exerciseService = inject(ExercisesService)

  activeGoal = signal<any>({})

  activeExerciseForm = new FormGroup({
    activeExercise: new FormControl('', {
      validators: [ Validators.required]
    }),
  })


  selectedExercise: string = ''

  rangeType = signal<'daily' | 'weekly' | 'monthly' | 'annual'>('daily')
  rangeType$ = toObservable(this.rangeType)

  loading = signal<boolean>(true)

  dateFormat = computed(()=>{
    switch (this.rangeType()) {
      case 'daily':
        return 'EEEE, MMMM d'
      case 'weekly':
        return 'd MMMM'
      case 'monthly':
        return 'd MMMM'
      case 'annual':
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
  
  exercises = computed(()=>{    
    return this.exerciseService.loadedExercises().map((el)=>{
      return {
        value: el.id,
        label: el.basic_activity_exercise.name
      }
    })
  })

  rangeGoalForChart = computed(()=>{
    switch(this.rangeType()){
      case 'daily':
        return 'daily'
      case 'weekly':
        return 'daily'
      case 'monthly':
        return 'daily'
      case 'annual':
        return 'monthly'
    }

  })

  async ngOnInit() {
    await this.activityService.fetchActivities()
    await this.exerciseService.fetchExercises()
    await this.goalStore.loadAll()
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

  async changeSel(e: MatButtonToggleChange){
    this.activityService.endRange.set(new Date())

    this.rangeType.set(e.value)

    switch (this.rangeType()) {
      case 'daily':        
        this.activityService.startRange.set(new Date())
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.endRange(), -6))        
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -1))
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -12))
        break;
    }
    await this.activityService.fetchActivities()  

    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => goal.exercise_id === this.activeExerciseForm.value.activeExercise)
  
    this.activeGoal.set(activeGoal)

    
    this.formatDataForChart()
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

  async goBefore(){
    switch (this.rangeType()) {
      case 'daily':        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), -1))
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -7))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), -7))
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -1))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), -1))
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), -12))
        break;
      }
    await this.activityService.fetchActivities()

    this.formatDataForChart()
  }

  async goAfter(){
    switch (this.rangeType()) {
      case 'daily':        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), 1))
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 7))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), 7))
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 1))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), 1))
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), 12))
        break;
    }
    await this.activityService.fetchActivities() 

    this.formatDataForChart()
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

  getValue(goalType: string, exerciseId: string){
    return this.goalStore.goals().find(el => el.range === goalType && el.exercise_id === exerciseId)
  }

  changeActiveExercise(){
    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => goal.exercise_id === this.activeExerciseForm.value.activeExercise)

    this.activeGoal.set(activeGoal)
    this.formatDataForChart()
  }

  formatDataForChart(){        
    this.formatDataChart.formatData(
      this.activityService.loadedAllActivities(), 
      this.rangeType(),
      this.activityService.startRange(),
      this.activityService.endRange(),
      this.activeExerciseForm.value.activeExercise!,
      this.activeGoal()?.quantity
    )
  }
}
