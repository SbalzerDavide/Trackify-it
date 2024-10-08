import { Component, computed, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ActivityService } from '../../../components/activity.service';
import { DialogDatepickerComponent } from '../../../components/activity/dialog-datepicker/dialog-datepicker.component';

@Component({
  selector: 'app-range-bar',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule, DatePipe, MatButtonModule],
  templateUrl: './range-bar.component.html',
  styleUrl: './range-bar.component.css'
})
export class RangeBarComponent {
  rangeType = input<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');

  changeRange = output<'daily' | 'weekly' | 'monthly' | 'annual' | null>()

  readonly dialog = inject(MatDialog);

  activityService = inject(ActivityService)
  
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

  changeDay(date: Date, daysToAdd: number) {
    let newDate = new Date(date);

    newDate.setDate(newDate.getDate() + daysToAdd);

    return newDate;
  }

  changeMonth(date: Date, monthToAdd: number) {
    let newDate = new Date(date);

    newDate.setMonth(newDate.getMonth() + monthToAdd);

    return newDate;
  }


  async changeSel(e: MatButtonToggleChange){
    this.activityService.endRange.set(new Date())
    const rangeType = e.value

    switch (rangeType) {
      case 'daily':        
        this.activityService.startRange.set(new Date())
        break;
      case 'weekly':
        this.activityService.startRange.set(this.changeDay(this.activityService.endRange(), -6))        
        break;
      case 'monthly':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -1))
        break;
      case 'annual':
        this.activityService.startRange.set(this.changeMonth(this.activityService.endRange(), -12))
        break;
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
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), -1))
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
        this.activityService.endRange.set(this.changeMonth(this.activityService.endRange(), 1))
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
