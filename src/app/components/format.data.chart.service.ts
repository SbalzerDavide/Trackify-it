import { inject, Injectable } from '@angular/core';
import { ActivityService } from './activity.service';

@Injectable({
  providedIn: 'root'
})
export class FormatDataChartService {

  activityService = inject(ActivityService)

  constructor() { }

  private getOrderedDates(
    rangeType: 'daily' | 'weekly' | 'monthly' | 'annual',
    startDate: Date,
    endDate: Date,
  ){
    let first = ''
    let last = ''
    let orderedDate = []
    switch (rangeType) {
      case 'weekly':
        first = `${startDate.getMonth() + 1}/${startDate.getDate()}`
        last = `${endDate.getMonth() + 1}/${endDate.getDate()}`

        orderedDate.push(first)
        for(let i = 0; i < 5; i++){
          orderedDate.push('')
        }
        orderedDate.push(last)
        break;
      case 'monthly':
        const daysCount = Math.ceil(Math.abs((endDate.valueOf() - startDate.valueOf())) / (1000 * 60 * 60 * 24))
        
        first = `${startDate.getUTCFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}`
        last = `${endDate.getUTCFullYear()}/${endDate.getMonth() + 1}/${endDate.getDate()}`

        orderedDate.push(first)
        for(let i = 0; i < daysCount - 2; i++){
          orderedDate.push('')
        }
        orderedDate.push(last)
        break;
      case 'annual':
        first = `${startDate.getUTCFullYear()}/${startDate.getMonth() + 1}`
        last = `${endDate.getUTCFullYear()}/${endDate.getMonth() + 1}`

        orderedDate.push(first)
        for(let i = 0; i < 10; i++){
          orderedDate.push('')
        }
        orderedDate.push(last)
        break;
    }
    return orderedDate;
  }

  getDailyOrderedData(data: any[], orderedDate: string[], startDate: Date, endDate: Date){
    let activeDate: any;
    let orderedData: {date: string, quantity: number}[] = []
    orderedDate.forEach((date, index, array) => {
      if(date === ''){
        activeDate.setDate(activeDate.getDate() + 1);            
      } else if(index === 0){
        activeDate = new Date(startDate)
      } else if(index === array.length -1){
        activeDate = endDate
      }
      const activeFormattedDate = this.activityService.pgFormatDate(activeDate)
      let valueForActiveDate = data.find(el => el.date === activeFormattedDate)
      if(valueForActiveDate){
        orderedData.push({
          date: activeFormattedDate,
          quantity: valueForActiveDate.quantity
        })
      } else{
        orderedData.push({
          date: activeFormattedDate,
          quantity: 0
        })
      }
    })
    return orderedData
  }

  getMonthlyOrderedData(data: any[], orderedDate: string[], startDate: Date, endDate: Date){
    let orderedData: {date: string, quantity: number}[] = []
    
    let activeMonth: {
      date: Date,
      month: number,
      year: number
    };

    orderedDate.forEach((date, index, array) => {
      if(date === ''){
        const addMonth = new Date(activeMonth.date.setMonth(activeMonth.date.getMonth() + 1 ));
        activeMonth = {
          date: addMonth,
          month: addMonth.getMonth(),
          year: addMonth.getUTCFullYear()
        }           
      } else if(index === 0){
        const newDate = new Date(startDate)
        activeMonth = {
          date: newDate,
          month: newDate.getMonth(),
          year: newDate.getUTCFullYear()
        }
      } else if(index === array.length -1){
        const newDate = new Date(endDate)
        activeMonth = {
          date: newDate,
          month: newDate.getMonth(),
          year: newDate.getUTCFullYear()
        }
      }

      let valueForAcriveMonth = data.filter(el => {
        const date = new Date(el.date)
        if(activeMonth.month === date.getMonth() && activeMonth.year === date.getUTCFullYear()){
          return true
        } else {
          return false
        }
      })

      let totalQuantity: number = 0
      valueForAcriveMonth.forEach(el=>{
        totalQuantity += el.quantity
      })

      orderedData.push({
        date: activeMonth.month.toString(),
        quantity: totalQuantity
      })
    })
    return orderedData        
  }

  formatData(
    data: any[], 
    rangeType: 'daily' | 'weekly' | 'monthly' | 'annual',
    startDate: Date,
    endDate: Date,
    exerciseId: string,
    activeGoal: number | undefined
  ){      
      const orderedDate = this.getOrderedDates(rangeType, startDate, endDate)
      const filteredFromExercise = data.filter(el => el.exercise_id === exerciseId)
      let orderedData: {date: string, quantity: number}[] = []

      switch(rangeType){
        case 'weekly':
          orderedData = this.getDailyOrderedData(filteredFromExercise, orderedDate, startDate, endDate)
          break;
        case 'monthly':
          orderedData = this.getDailyOrderedData(filteredFromExercise, orderedDate, startDate, endDate)
          break;
        case 'annual':
          orderedData = this.getMonthlyOrderedData(filteredFromExercise, orderedDate, startDate, endDate)
          break;
      }
      const seriesData = orderedData.map(el =>{
        if(activeGoal && el.quantity >= activeGoal){          
          return {
            value: +el.quantity,
            itemStyle: {
              color: '#7FB685'
            }
          }
        } else{
          return el.quantity
        }
      })   
      
      return {
        xData: orderedDate,
        data: seriesData,      
      }      
  }
}
