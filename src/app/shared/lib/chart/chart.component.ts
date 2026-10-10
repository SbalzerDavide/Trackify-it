import { Component, computed, input } from '@angular/core';

import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { EChartsOption } from 'echarts';


@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
  providers: [ provideEcharts() ]
})
export class ChartComponent {
  echartsInstance: any

  type = input<'line' | 'bar'>('bar')
  xType = input<'value' | 'category' | 'time' | 'log'>('category')
  yType = input<'value' | 'category' | 'time' | 'log'>('value')
  xData = input<string[] | undefined>([])
  data = input<any[] | undefined>([])
  goal = input<number | undefined>()

  chartOption = computed<EChartsOption>(()=> {
    const goal = this.goal()
    const hasGoal = goal !== undefined && goal !== null && goal > 0

    return {
      xAxis: {
        type: this.xType(),
        data: this.xData(),
        axisLabel: {
          showMaxLabel: true,
        }      
      },
      yAxis: {
        type: this.yType(),
        min: 'dataMin',
        startValue: 0,
        max: this.getMaxValue(this.data(), goal)
      },
      series: [
        { 
          type: this.type(),
          data: this.data(),
          markLine: hasGoal ? {
            silent: true,
            symbol: ['none', 'none'],
            lineStyle: { type: 'dashed', width: 2 },
            label: { show: true, position: 'insideEndTop', formatter: `Goal ${goal}` },
            data: [{ name: 'Goal', yAxis: goal }]
          } : undefined
        },
      ],
    }
  })

  onChartInit(ec: any){
    this.echartsInstance = ec;
  }

  getMaxValue(values: any[] | undefined, goal: number | undefined){
    const valueClean = values?.map(el=>{
      if(el.value){
        return el.value
      } else{
        return el
      }
    })
    let maxValue: number = 1
    if(valueClean){
      maxValue = Math.max(1, ...valueClean)
    }


    if(!goal){
      return maxValue
    } else {
      if(maxValue > goal){
        return maxValue
      } else{
        return goal
      }
    }                

  }

}
