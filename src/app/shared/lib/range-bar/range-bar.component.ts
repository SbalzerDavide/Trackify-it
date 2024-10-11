import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { DialogDatepickerComponent } from '../../../components/activity/dialog-datepicker/dialog-datepicker.component';
import { FormatDataChartService } from '../../../components/format-data-chart.service';
import { Range } from '../../../components/activity.model';


@Component({
  selector: 'app-range-bar',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule, DatePipe, MatButtonModule],
  templateUrl: './range-bar.component.html',
  styleUrl: './range-bar.component.css'
})
export class RangeBarComponent {
  rangeType = input<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
  showDaily = input<boolean>(true)
  isChartPage = input<boolean>(false)
  isAbsolute = input<boolean>(false)
  startRange = input.required<Date>()
  endRange = input.required<Date>()

  changeRange = output<'daily' | 'weekly' | 'monthly' | 'annual'>()
  changeRangeVal = output<Range>()

  readonly dialog = inject(MatDialog);

  formatDataChart = inject(FormatDataChartService)
  
  dateFormat = computed(()=>{
    switch (this.rangeType()) {
      case 'daily':
        return 'EEEE, MMMM d'
      case 'weekly':
        return 'd MMMM'
      case 'monthly':
        return 'd MMMM'
      case 'annual':
       return 'd MMMM y'
    }
  })

  isSameDay = computed(()=>{
    if(this.startRange().getFullYear() === this.endRange().getFullYear() &&
      this.startRange().getMonth() === this.endRange().getMonth() &&
      this.startRange().getDate() === this.endRange().getDate()){
        return true;
    } else{
      return false
    }
  })

  private getLastMonthDay(date: Date){
    let lastDay = new Date (date.setMonth(date.getMonth() + 1))
    lastDay.setDate(1)
    lastDay.setDate(lastDay.getDate() -1)
    
    return lastDay
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

  async changeSel(e: MatButtonToggleChange){
    const rangeType = e.value
    this.changeRange.emit(rangeType)
  }

  async goBefore(){
    let range: Range = {
      startRange: null,
      endRange: null
    }
    switch (this.rangeType()) {
      case 'daily':        
        range.startRange = this.changeDay(this.startRange(), -1)
        range.endRange = this.changeDay(this.endRange(), -1)
        break;
      case 'weekly':
        range.startRange = this.changeDay(this.startRange(), -7)
        range.endRange = this.changeDay(this.endRange(), -7)
        break;
      case 'monthly':
        range.startRange = this.changeMonth(this.startRange(), -1)

        if(this.isAbsolute() === true){
          // remove 40 days for go to previous month and then, with this new day, calc last day of this month
          const nextMonthDay = this.changeDay(this.endRange(), - 40)
          range.endRange = this.getLastMonthDay(nextMonthDay)
        } else{
          range.endRange = this.changeMonth(this.endRange(), -1)
        }
        break;
      case 'annual':
        range.startRange = this.changeMonth(this.startRange(), -12)
        range.endRange = this.changeMonth(this.endRange(), -12)
        break;
      }

    this.changeRangeVal.emit(range)
  }

  async goAfter(){
    let range: Range = {
      startRange: null,
      endRange: null
    }
    switch (this.rangeType()) {
      case 'daily':        
        range.startRange = this.changeDay(this.startRange(), 1)
        range.endRange = this.changeDay(this.endRange(), 1)
        break;
      case 'weekly':
        range.startRange = this.changeDay(this.startRange(), 7)
        range.endRange = this.changeDay(this.endRange(), 7)
        break;
      case 'monthly':
        range.startRange = this.changeMonth(this.startRange(), 1)
        if(this.isAbsolute() === true){
          // add 5 days for go to next month and then, with this new day, calc last day of this month
          const nextMonthDay = this.changeDay(this.endRange(), 5)
          range.endRange = this.getLastMonthDay(nextMonthDay)
        } else{
          range.endRange = this.changeMonth(this.endRange(), 1)
        }
        break;
      case 'annual':
        range.startRange = this.changeMonth(this.startRange(), 12)
        range.endRange = this.changeMonth(this.endRange(), 12)
        break;
    }

    this.changeRangeVal.emit(range)
  }

  openCalendar(){
    if(this.rangeType() === 'daily'){
      const dialogRef = this.dialog.open(DialogDatepickerComponent);
  
      dialogRef.afterClosed().subscribe(result => {        
        if (result !== undefined) {
          const range: Range = {
            startRange: new Date(result),
            endRange: new Date(result)
          }
          this.changeRangeVal.emit(range)
        }
      });
    }
  }
}
