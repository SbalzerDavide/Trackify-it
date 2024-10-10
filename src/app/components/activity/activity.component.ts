import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ActivityService } from '../activity.service';
import { CardComponent } from '../../shared/lib/card/card.component';
import { GoalStore } from '../goal.store';
import { ChartComponent } from "../../shared/lib/chart/chart.component";
import { FormatDataChartService } from '../format.data.chart.service';
import { ExercisesService } from '../exercises.service';
import { RangeBarComponent } from "../../shared/lib/range-bar/range-bar.component";
import { ChartFormattedData } from '../chart.model';


@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CardComponent, MatProgressSpinnerModule, ChartComponent, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, RangeBarComponent, MatSlideToggleModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent implements OnInit{
  activityService = inject(ActivityService)

  goalStore = inject(GoalStore)

  formatDataChart = inject(FormatDataChartService)

  exerciseService = inject(ExercisesService)

  activeGoal = signal<any>({})
  rangeType = signal<'daily' | 'weekly' | 'monthly' | 'annual'>('daily')
  loading = signal<boolean>(true)
  dataChart = signal<ChartFormattedData | null>(null)

  activeExerciseForm = new FormGroup({
    activeExercise: new FormControl('', {
      validators: [ Validators.required]
    }),
    isRangeAbsolute: new FormControl(false)
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
    this.activeExerciseForm.valueChanges.subscribe({
      next: (val)=>{
        console.log(val);
        if(val.isRangeAbsolute === true){
          this.activityService.isRangeAbsolute.set(true)
        } else if(val.isRangeAbsolute === false){
          this.activityService.isRangeAbsolute.set(false)
        }
        this.formatDataChart.updateRange(this.rangeType())

        
        this.setActiveGoal()
      }
    })   
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

  async onChangeRange(rangeType:'daily' | 'weekly' | 'monthly' | 'annual' | null){    
    if(rangeType){
      this.rangeType.set(rangeType)
    }
    // await this.activityService.fetchActivities()
    this.setActiveGoal()
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

  async setActiveGoal(){
    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => goal.exercise_id === this.activeExerciseForm.value.activeExercise)

    this.activeGoal.set(activeGoal)
    await this.activityService.fetchActivities()

    this.formatDataForChart()
  }

  formatDataForChart(){ 
    const filteredFromExercise = this.activityService.loadedAllActivities().filter(el => el.exercise_id === this.activeExerciseForm.value.activeExercise!)

    this.dataChart.set(this.formatDataChart.formatData(
      filteredFromExercise, 
      this.rangeType(),
      this.activityService.startRange(),
      this.activityService.endRange(),
      this.activeGoal()?.quantity
    ))
  }
}
