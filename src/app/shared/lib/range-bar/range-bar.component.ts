import { Component, computed, inject, input, OnInit, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ActivityService } from '../../../components/activity.service';
import { DialogDatepickerComponent } from '../../../components/activity/dialog-datepicker/dialog-datepicker.component';
import { FormatDataChartService } from '../../../components/format.data.chart.service';

@Component({
  selector: 'app-range-bar',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule, DatePipe, MatButtonModule],
  templateUrl: './range-bar.component.html',
  styleUrl: './range-bar.component.css'
})
export class RangeBarComponent implements OnInit {
  rangeType = input<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
  showDaily = input<boolean>(true)
  isChartPage = input<boolean>(false)
  isAbsolute = input<boolean>(false)

  changeRange = output<'daily' | 'weekly' | 'monthly' | 'annual' | null>()

  readonly dialog = inject(MatDialog);

  activityService = inject(ActivityService)
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
    if(this.activityService.startRange().getFullYear() === this.activityService.endRange().getFullYear() &&
      this.activityService.startRange().getMonth() === this.activityService.endRange().getMonth() &&
      this.activityService.startRange().getDate() === this.activityService.endRange().getDate()){
        return true;
    } else{
      return false
    }
  })

  ngOnInit(): void {
    if(this.showDaily() === false){
      this.activityService.startRange.set(this.changeDay(this.activityService.endRange(), -6))        
    }
  }

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

    if(this.isChartPage() === false){
      // only if not in charts page
      this.activityService.endRange.set(new Date())
  
      this.formatDataChart.updateRange(rangeType)
    }
    
    this.changeRange.emit(rangeType)
  }

  async goBefore(){
    switch (this.rangeType()) {
      case 'daily':        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), -1))
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), -7))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), -7))
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -1))

        if(this.isAbsolute() === true){
          // remove 40 days for go to previous month and then, with this new day, calc last day of this month
          const nextMonthDay = this.changeDay(this.activityService.endRange(), - 40)
          this.activityService.endRange.set(this.getLastMonthDay(nextMonthDay))          
        } else{
          this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), -1))
        }
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), -12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), -12))
        break;
      }

    this.changeRange.emit(null)
  }

  async goAfter(){
    switch (this.rangeType()) {
      case 'daily':        
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 1))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), 1))
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.startRange(), 7))
        this.activityService.endRange.set(this.changeDay(this.activityService.endRange(), 7))
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 1))
        if(this.isAbsolute() === true){
          // add 5 days for go to next month and then, with this new day, calc last day of this month
          const nextMonthDay = this.changeDay(this.activityService.endRange(), 5)
          this.activityService.endRange.set(this.getLastMonthDay(nextMonthDay))          
        } else{
          this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), 1))
        }
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.startRange(), 12))
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), 12))
        break;
    }

    this.changeRange.emit(null)
  }

  openCalendar(){
    if(this.rangeType() === 'daily'){
      const dialogRef = this.dialog.open(DialogDatepickerComponent);
  
      dialogRef.afterClosed().subscribe(result => {        
        if (result !== undefined) {
          this.activityService.startRange.set(new Date(result))
          this.activityService.endRange.set(new Date(result))
        }
      });
    }
  }
}
