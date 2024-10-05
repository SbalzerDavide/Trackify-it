import { Component, computed, DestroyRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

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
export class ChartComponent implements OnInit{
  echartsInstance: any

  private destroyRef = inject(DestroyRef)


  type = input<'line' | 'bar'>('bar')
  xType = input<'value' | 'category' | 'time' | 'log'>('category')
  yType = input<'value' | 'category' | 'time' | 'log'>('value')
  xData = input<string[]>()
  data = input<any[]>()
  goal = input<number | undefined>()

  xData$ = toObservable(this.xData)
  data$ = toObservable(this.data)
  

  chartOption = computed<EChartsOption>(()=> {
    return {
      xAxis: {
        type: this.xType(),
        data: [],
        axisLabel: {
          showMaxLabel: true,
        }      
      },
      yAxis: {
        type: this.yType(),
        min: 'dataMin',
        startValue: 0
      },
      series: [
        { type: this.type() },
      ],
    }
  })

  ngOnInit(): void {
    const subscriptionXData = this.xData$.subscribe({
      next: (value) => {
        if(this.echartsInstance){
          this.echartsInstance.setOption({
            xAxis: {
              type: this.xType(),
              data: value,
            },  
          })
        }
      }
    })
    const subscriptionData = this.data$.subscribe({
      next: (value) => {        
        const max = this.getMaxValue(value, this.goal())
        
        if(this.echartsInstance){
          let markLine: {}
          if(this.goal()){  
            markLine = {
              label: 'goal',
              symbol: ['none'],
              data: [{
                name: 'Goal',
                yAxis: this.goal()
              }]
            }        
          } else{
            markLine = {
              label: 'goal',
              symbol: ['none'],
              data: [{
                name: 'Goal',
                yAxis: 0
              }]
            }
          }
          
          
          this.echartsInstance.setOption({
            yAxis: {
              max: max
            },
            series: [
              {
                data: value,
                type: 'bar',
                markLine: markLine,
              },
            ]
          })
        }
      }
    })

    // clean subscription
    this.destroyRef.onDestroy(()=>{
      subscriptionXData.unsubscribe()
      subscriptionData.unsubscribe()
    })
    
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
      maxValue = Math.max(...valueClean!)
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

  onChartInit(ec: any){
    this.echartsInstance = ec;
  }

}
