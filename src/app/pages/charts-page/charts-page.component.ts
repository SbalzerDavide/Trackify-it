import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { RangeBarComponent } from '../../shared/lib/range-bar/range-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ExercisesService } from '../../components/exercises.service';
import { ChartComponent } from "../../shared/lib/chart/chart.component";
import { ChartFormattedData } from '../../components/chart.model';
import { ActivityService } from '../../components/activity.service';
import { FormatDataChartService } from '../../components/format-data-chart.service';
import { GoalStore } from '../../components/goal.store';

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [RangeBarComponent, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, ChartComponent, MatSlideToggleModule],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.css'
})
export class ChartsPageComponent implements OnInit {

  rangeType = signal<'daily' | 'weekly' | 'monthly' | 'annual'>('weekly')
  exerciseId = signal<string | undefined>('')
  dataChart = signal<ChartFormattedData | null>(null)
  activeGoal = signal<any>({})
  data = signal<any[]>([])

  goalStore = inject(GoalStore)

  exerciseService = inject(ExercisesService)
  activityService = inject(ActivityService)
  formatDataChart = inject(FormatDataChartService)

  constructor( private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {
    await this.exerciseService.fetchExercises()
    await this.goalStore.loadAll()

    this.activeExerciseForm.valueChanges.subscribe({
      next: (val)=>{        
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            "exercise-id": val.activeExercise,
            "is-range-absolute": val.isRangeAbsolute
          },
          queryParamsHandling: 'merge'
        })
      }
    })   

    this.route.queryParams
      .subscribe({
        next: params =>{
          this.exerciseId.set(params?.['exercise-id'])      
          if(params?.['is-range-absolute']){
            switch(params?.['is-range-absolute']){
              case 'true':
                this.activityService.isRangeAbsolute.set(true)
                break;
              case 'false':
                this.activityService.isRangeAbsolute.set(false)
                break;
              default:
                this.activityService.isRangeAbsolute.set(false)
                break;
            }
          } 
          
          const rangeType = params?.['range-type']
          if(rangeType){
            this.rangeType.set(rangeType)
          }          
          this.formatDataChart.updateRange(this.rangeType())
          if(this.exerciseId()){
            this.setDataForChart()
          }
        }
      });
  }

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

  total = computed(()=>{
    if(this.activityService.loadedActivities().length > 0){
      return this.activityService.loadedActivities()[0].quantity
    } else {
      return 0
    }
  })

  async onChangeRange(rangeType: 'daily' | 'weekly' | 'monthly' | 'annual' | null){
    if(rangeType){
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          "range-type": rangeType
        },
        queryParamsHandling: 'merge'
      })
    } else{
      if(this.exerciseId()){
        this.setDataForChart()
      }
    }
  }

  async setDataForChart(){
    await this.activityService.fetchFilteredActivities(this.exerciseId()!)

    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => goal.exercise_id === this.activeExerciseForm.value.activeExercise)

    this.activeGoal.set(activeGoal)    
    
    this.dataChart.set(this.formatDataChart.formatData(
      this.activityService.loadedAllActivities(), 
      this.rangeType(),
      this.activityService.startRange(),
      this.activityService.endRange(),
      this.activeGoal()?.quantity
    ))
  }

}
