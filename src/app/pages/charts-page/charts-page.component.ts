import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';

import { RangeBarComponent } from '../../shared/lib/range-bar/range-bar.component';
import { ExercisesService } from '../../components/exercises.service';
import { ChartComponent } from "../../shared/lib/chart/chart.component";
import { ChartFormattedData } from '../../components/chart.model';
import { ActivityService } from '../../components/activity.service';
import { FormatDataChartService } from '../../components/format-data-chart.service';
import { GoalStore } from '../../components/goal.store';
import { Range } from '../../components/activity.model';
import { ChartService } from '../../shared/lib/chart.service';
import { FormSaveChartComponent } from '../../components/charts/form-save-chart/form-save-chart.component';

@Component({
  selector: 'app-charts-page',
  standalone: true,
  imports: [RangeBarComponent, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, ChartComponent, MatSlideToggleModule, MatButtonModule],
  templateUrl: './charts-page.component.html',
  styleUrl: './charts-page.component.css'
})
export class ChartsPageComponent implements OnInit {

  readonly dialog = inject(MatDialog);

  private destroyRef = inject(DestroyRef)

  rangeType = signal<'daily' | 'weekly' | 'monthly' | 'annual'>('weekly')
  chartTypes = signal<string[]>(['bar', 'line'])
  exerciseId = signal<string | undefined>('')
  dataChart = signal<ChartFormattedData | null>(null)
  activeGoal = signal<any>({})
  startRange = signal<Date>(new Date(new Date().setDate(new Date().getDate() - 6)))
  endRange = signal<Date>(new Date())
  isRangeAbsolute = signal<boolean>(false)
  data = signal<any[]>([])

  goalStore = inject(GoalStore)

  exerciseService = inject(ExercisesService)
  activityService = inject(ActivityService)
  formatDataChart = inject(FormatDataChartService)
  chartService = inject(ChartService)

  constructor( private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {    
    await this.exerciseService.fetchExercises()
    await this.goalStore.loadAll()

    const subscriptionUpdateActivities = this.activityService.updateActivities.subscribe(val => {
      this.setDataForChart()
    })

    const subscriptionsForm = this.activeExerciseForm.valueChanges.subscribe({
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

    const subscriptionParams = this.route.queryParams
      .subscribe({
        next: params =>{     
          let changeIsAbsolute: boolean
          if(params?.['exercise-id'] === this.isRangeAbsolute()){
            changeIsAbsolute = false
          } else{
            changeIsAbsolute = true
          }
  
          this.exerciseId.set(params?.['exercise-id'])      
          if(params?.['is-range-absolute']){
            switch(params?.['is-range-absolute']){
              case 'true':
                this.isRangeAbsolute.set(true)
                break;
              case 'false':
                this.isRangeAbsolute.set(false)
                break;
              default:
                this.isRangeAbsolute.set(false)
                break;
            }
          } 
          
          const rangeType = params?.['range-type']
          if(rangeType){
            this.rangeType.set(rangeType)
          } 

          if(changeIsAbsolute){
            this.endRange.set(new Date())
          }
    
          const range: Range = this.formatDataChart.updateRange(this.rangeType(), this.isRangeAbsolute(), this.endRange())
          if(range.startRange){
            this.startRange.set(range.startRange)
          }
          if(range.endRange){
            this.endRange.set(range.endRange)
          }
      
          if(this.exerciseId()){
            this.setDataForChart()
          }
        }
      });

    this.destroyRef.onDestroy(()=>{
      subscriptionParams.unsubscribe()
      subscriptionsForm.unsubscribe()
      subscriptionUpdateActivities.unsubscribe()
    })
  }

  activeExerciseForm = new FormGroup({
    activeExercise: new FormControl('', {
      validators: [ Validators.required]
    }),
    isRangeAbsolute: new FormControl(false),
    // chartType: new FormControl<'line' | 'bar'>('bar')
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
    const goupingActivity = this.activityService.getGroupingActivity(this.data()) 
    if(goupingActivity.length > 0){
      return goupingActivity[0].quantity
    } else {
      return 0
    }
  })

  async onChangeRange(rangeType: 'daily' | 'weekly' | 'monthly' | 'annual'){
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        "range-type": rangeType
      },
      queryParamsHandling: 'merge'
    })
  }

  onChangeRangeVal(range: Range){
    if(range.startRange){
      this.startRange.set(range.startRange)
    }
    if(range.endRange){
      this.endRange.set(range.endRange)
    }
    if(this.exerciseId()){
      this.setDataForChart()
    }
  }

  private async setDataForChart(){    
    const data = await this.activityService.fetchFilteredActivities(this.exerciseId()!, this.startRange(), this.endRange())
    this.data.set(data)

    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => goal.exercise_id === this.activeExerciseForm.value.activeExercise)

    this.activeGoal.set(activeGoal)    
    
    this.dataChart.set(this.formatDataChart.formatData(
      this.data(), 
      this.rangeType(),
      this.startRange(),
      this.endRange(),
      this.activeGoal()?.quantity
    ))
  }

  openDialog() {
    this.dialog.open(FormSaveChartComponent, {
      data: {
        exercises: this.exercises(),
        activeExercise: this.exerciseId(),
        isRangeAbsolute: this.isRangeAbsolute(),
        rangeType: this.rangeType()
      },
    });
  }
}
