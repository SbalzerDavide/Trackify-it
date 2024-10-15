import { CUSTOM_ELEMENTS_SCHEMA, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { FormActivityComponent } from '../../components/activity/form-activity/form-activity.component';
import { ActivityService } from '../../components/activity.service';
import { CardComponent } from "../../shared/lib/card/card.component";
import { ChartService } from '../../shared/lib/chart.service';
import { FormatDataChartService } from '../../components/format-data-chart.service';
import { Range } from '../../components/activity.model';
import { GoalStore } from '../../components/goal.store';
import { ChartInfo } from '../../shared/lib/chart.model';
import { ChartComponent } from "../../shared/lib/chart/chart.component";
import { CustomCardComponent } from "../../shared/lib/custom-card/custom-card.component";
import { SwiperComponent } from "../../shared/lib/swiper/swiper.component";
import { FormSaveChartComponent } from '../../components/charts/form-save-chart/form-save-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, CardComponent, ChartComponent, CustomCardComponent, SwiperComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class DashboardComponent implements OnInit {
  data = signal<any[]>([])
  charts = signal<ChartInfo[]>([])

  readonly dialog = inject(MatDialog);

  activityService = inject(ActivityService)
  chartService = inject(ChartService)
  formatDataChart = inject(FormatDataChartService)

  goalStore = inject(GoalStore)

  private destroyRef = inject(DestroyRef)

  loadedActivities = computed(()=>{
    return this.activityService.getGroupingActivity(this.data()) 
  })

  async ngOnInit() {
    await this.goalStore.loadAll()

    await this.fetchCharts()

    await this.fetchData()

    const subscriptionUpdateActivities = this.activityService.updateActivities.subscribe(val => {
      this.fetchCharts()
      this.fetchData()
      })
    const subscriptionUpdateChiarts = this.chartService.updateCharts.subscribe(val => {
      this.fetchCharts()
    })
    this.destroyRef.onDestroy(()=> {
      subscriptionUpdateActivities.unsubscribe()
      subscriptionUpdateChiarts.unsubscribe()
    })
  }

  openDialog() {
    this.dialog.open(FormActivityComponent);
  }

  onOpenSettings(chartIndex: number){
    const chart = this.charts()[chartIndex]
    
    this.dialog.open(FormSaveChartComponent, {
      data: {
        activeExercise: chart.exercise_id,
        name: chart.name,
        isRangeAbsolute: chart.is_range_absolute,
        rangeType: chart.range_type,
        showInDashboard: chart.show_in_dashboard,
        chartId: chart.id
      },
    });

    
  }

  private getRangeGoalForChart(rangeType: 'weekly' | 'monthly' | 'annual'){
    switch(rangeType){
      case 'weekly':
        return 'daily'
      case 'monthly':
        return 'daily'
      case 'annual':
        return 'monthly'
    }
  }

  private getTotal(data: any){
    const goupingActivity = this.activityService.getGroupingActivity(data) 
    if(goupingActivity.length > 0){
      return goupingActivity[0].quantity
    } else {
      return 0
    }
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
    await this.fetchCharts()
  }

  private async fetchCharts(){
    const charts = await this.chartService.getDashboadCharts()
    const completeChart: ChartInfo[] = await Promise.all(charts.map(async (chart) => {
      const range: Range = this.formatDataChart.updateRange(chart.range_type, chart.is_range_absolute, new Date())

      const data = await this.activityService.fetchFilteredActivities(chart.exercise_id, range.startRange!, range.endRange!)
      const total = this.getTotal(data)
      const rangeGoalForChart = this.getRangeGoalForChart(chart.range_type)
      const activeGoal = this.goalStore.goals().filter(goal => goal.range === rangeGoalForChart)
        .find(goal => goal.exercise_id === chart.exercise_id)

      const dataChart = this.formatDataChart.formatData(
        data, 
        chart.range_type,
        range.startRange!,
        range.endRange!,
        activeGoal?.quantity
      )

      return {
        ...chart,
        startRange: range.startRange!,
        endRange: range.endRange!,
        total: total,
        data: {
          data: dataChart.data,
          xdata: dataChart.xData,
          goal: activeGoal?.quantity
        }
      }
      
    }))
    
    this.charts.set(completeChart)
  }
}
