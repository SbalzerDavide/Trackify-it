import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';

import { RangeBarComponent } from '../../shared/lib/range-bar/range-bar.component';
import { EntitiesService } from '../../components/entities.service';
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
  entityId = signal<number | undefined>(undefined)
  dataChart = signal<ChartFormattedData | null>(null)
  activeGoal = signal<any>({})
  startRange = signal<Date>(new Date(new Date().setDate(new Date().getDate() - 6)))
  endRange = signal<Date>(new Date())
  isRangeAbsolute = signal<boolean>(false)
  data = signal<any[]>([])
  disableFormChangeNatigation = signal<boolean>(false)

  goalStore = inject(GoalStore)

  entitiesService = inject(EntitiesService)
  activityService = inject(ActivityService)
  formatDataChart = inject(FormatDataChartService)
  chartService = inject(ChartService)

  constructor( private router: Router, private route: ActivatedRoute) { }

  async ngOnInit() {    
    await this.entitiesService.fetchEntities()
    await this.goalStore.loadAll()

    const subscriptionUpdateActivities = this.activityService.updateActivities.subscribe(val => {
      this.setDataForChart()
    })

    const subscriptionsForm = this.activeEntityForm.valueChanges.subscribe({
      next: (val)=>{       
         if(!this.disableFormChangeNatigation()){
           this.router.navigate([], {
             relativeTo: this.route,
             queryParams: {
               "entity-id": val.activeEntity,
               "is-range-absolute": val.isRangeAbsolute
             },
             queryParamsHandling: 'merge'
           })
         } else{
          this.disableFormChangeNatigation.set(false)
         }
      }
    })   

    const subscriptionParams = this.route.queryParams
      .subscribe({
        next: params =>{     
          let changeIsAbsolute: boolean
          if(params?.['entity-id'] === this.isRangeAbsolute()){
            changeIsAbsolute = false
          } else{
            changeIsAbsolute = true
          }
  
          this.entityId.set(+params?.['entity-id'])    

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

          if(this.entityId()){   
            this.disableFormChangeNatigation.set(true)                   
            this.activeEntityForm.controls.isRangeAbsolute.setValue(this.isRangeAbsolute())
            this.disableFormChangeNatigation.set(true)      
            this.activeEntityForm.controls.activeEntity.setValue(this.entityId()!)
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
      
          if(this.entityId()){
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

  activeEntityForm = new FormGroup({
    activeEntity: new FormControl(0, {
      validators: [ Validators.required]
    }),
    isRangeAbsolute: new FormControl(false),
    // chartType: new FormControl<'line' | 'bar'>('bar')
  })

  entities = computed(()=>{    
    return this.entitiesService.loadedEntities().map((el)=>{
      return {
        value: el.id,
        label: el.basic_entities?.name ?? el.name
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
    if(this.entityId()){
      this.setDataForChart()
    }
  }

  private async setDataForChart(){    
    const data = await this.activityService.fetchFilteredActivities(this.entityId()!.toString(), this.startRange(), this.endRange())
    this.data.set(data)

    const activeGoal = this.goalStore.goals().filter(goal => goal.range === this.rangeGoalForChart())
      .find(goal => +goal.entity_id === this.entityId())

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
        activeEntity: this.entityId(),
        isRangeAbsolute: this.isRangeAbsolute(),
        rangeType: this.rangeType()
      },
    });
  }
}
