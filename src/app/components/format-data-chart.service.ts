import { inject, Injectable } from '@angular/core';

import { ActivityService } from './activity.service';
import { Range } from './activity.model';

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

  private getDailyOrderedData(data: any[], orderedDate: string[], startDate: Date, endDate: Date){
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
      const activeFormattedDate = this.pgFormatDate(activeDate)
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

  private getMonthlyOrderedData(data: any[], orderedDate: string[], startDate: Date, endDate: Date){
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

  private getFirstWeekDay(date: Date){
    const currentDate = new Date(date);

    // Ottieni il giorno della settimana (0 = Domenica, 1 = Lunedì, ..., 6 = Sabato)
    const dayOfWeek = currentDate.getDay() - 1;

    // Calcola il numero di giorni da sottrarre per arrivare alla domenica
    const difference = currentDate.getDate() - dayOfWeek;

    // Crea un nuovo oggetto Date per il primo giorno della settimana
    const firstDayOfWeek = new Date(currentDate.setDate(difference));
    return firstDayOfWeek
  }

  private getLastWeekDay(date: Date){
    // Convertiamo la data in ingresso in un oggetto Date
    let myDate = new Date(date);

    // Otteniamo il giorno della settimana (0 per domenica, 6 per sabato)
    const dayOfWeek = myDate.getDay();

    // Calcoliamo quanti giorni mancano per arrivare a domenica
    let difference = 7 - dayOfWeek;
    
    // Se il giorno è domenica (0), non aggiungiamo nessun giorno
    if (dayOfWeek === 0) {
      difference = 0;
    }

    // Aggiungiamo la differenza per ottenere l'ultimo giorno della settimana (domenica)
    myDate.setDate(myDate.getDate() + difference);

    return myDate;
  }

  private getFirstMonthDay(date: Date){
    const firstDay = new Date(date)
    firstDay.setDate(1)
    
    return firstDay
  }

  private getLastMonthDay(date: Date){
    // set a day in the middle of the month for make sure not move forward two months
    const middeleDay = new Date(date.setDate(15))
    let lastDay = new Date (middeleDay.setMonth(middeleDay.getMonth() + 1))
    lastDay.setDate(1)
    lastDay.setDate(lastDay.getDate() -1)
    
    return lastDay
  }

  private getFirstDayYear(date: Date){
    let myDate = new Date(date)
    myDate.setMonth(0)
    myDate.setDate(1)
    return myDate
  }

  private getLastDayYear(date: Date){
    let myDate = new Date(date)
    myDate.setMonth(11)
    myDate.setDate(31)
    return myDate
  }

  private changeDay(date: Date, daysToAdd: number) {
    let newDate = new Date(date);

    newDate.setDate(newDate.getDate() + daysToAdd);

    return newDate;
  }

  private changeMonth(date: Date, monthToAdd: number) {
    let newDate = new Date(date);

    newDate.setMonth(newDate.getMonth() + monthToAdd);

    return newDate;
  }

  private pgFormatDate(date:Date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d:number) {
      return ("0" + d).slice(-2)
    }
  
    var parsed = new Date(date)
  
    return [parsed.getUTCFullYear(), zeroPad(parsed.getMonth() + 1), zeroPad(parsed.getDate())].join("-");
  }

  updateRange(rangeType: 'daily' | 'weekly' | 'monthly' | 'annual',
    isRangeAbsolute: boolean, 
    endRange: Date
  ){
    let range: Range = {
      startRange: null,
      endRange: endRange
    }
 
    if(isRangeAbsolute === true){
      switch(rangeType){
        case 'daily':        
          range.startRange = new Date()
          break;
        case 'monthly':
          range.startRange = this.getFirstMonthDay(new Date)
          range.endRange = this.getLastMonthDay(new Date)
          break;
        case 'weekly':
          range.startRange = this.getFirstWeekDay(new Date)
          range.endRange = this.getLastWeekDay(new Date)
          break;
        case 'annual':
          range.startRange = this.getFirstDayYear(new Date)
          range.endRange = this.getLastDayYear(new Date)
          break;
      }
    } else{
      switch (rangeType) {
        case 'daily':        
          range.startRange = new Date()
          break;
        case 'weekly':
          range.startRange = this.changeDay(endRange, -6)
          break;
        case 'monthly':
          range.startRange = this.changeMonth(endRange, -1)
          break;
        case 'annual':
          range.startRange = this.changeMonth(endRange, -12)
          break;
      }
    }
    return range
  }

  formatData(
    data: any[], 
    rangeType: 'daily' | 'weekly' | 'monthly' | 'annual',
    startDate: Date,
    endDate: Date,
    activeGoal: number | undefined
  ){      
      const dataByDay: any[] = []
      data.forEach(activity =>{
        const findIndex = dataByDay.findIndex(el => (el.date === activity.date) && el.exercise_id === activity.exercise_id)
        if(findIndex >= 0){
          dataByDay[findIndex].quantity += activity.quantity
        } else{
          dataByDay.push({...activity})
        }
      })       
      
      const orderedDate = this.getOrderedDates(rangeType, startDate, endDate)
      let orderedData: {date: string, quantity: number}[] = []

      switch(rangeType){
        case 'weekly':
          orderedData = this.getDailyOrderedData(dataByDay, orderedDate, startDate, endDate)
          break;
        case 'monthly':
          orderedData = this.getDailyOrderedData(dataByDay, orderedDate, startDate, endDate)
          break;
        case 'annual':
          orderedData = this.getMonthlyOrderedData(dataByDay, orderedDate, startDate, endDate)
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
