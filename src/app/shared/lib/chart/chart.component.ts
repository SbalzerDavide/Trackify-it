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
        let max: number | 'maxdata'
        if(value && value.length > 0 && !this.goal()){
          max = Math.max(...value!)
        } else if(value && value.length > 0 && this.goal()){
          max = Math.max(...value!) > this.goal()! ? Math.max(...value!) : this.goal()!
        } else {
          max = 'maxdata'
        }
        
        
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
                itemStyle: (value: any)=>{
                  return '#000'
                }
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

  onChartInit(ec: any){
    this.echartsInstance = ec;
  }

}
