import { inject, Injectable, signal } from '@angular/core';

import { SupabaseService } from '../shared/supabase/supabase.service';

import { ACTIVITIES } from './activity-model'; 
import { EXERCISES } from './exercises.model';
import { BASIC_ACTIVITY_EXERCISE } from './basic-activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private userActivities = signal<any[]>([])
  loadedActivities = this.userActivities.asReadonly()

  startRange = signal<Date>(new Date())
  endRange = signal<Date>(new Date())

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async fetchActivities(){
    const { data } = await this.supabaseService.supabase
    .from(ACTIVITIES)
    .select(`date, id, quantity, exercise_id,
      ${EXERCISES}( number_of_repetitions, ${BASIC_ACTIVITY_EXERCISE}( name, cal))`)
      .gte('date', this.pgFormatDate(this.startRange()))
      .lte('date', this.pgFormatDate(this.endRange()))
      // .eq('user_id', this.authService.session?.user.id)
          
    if(data){
      let groupingList: any[] = []
      data.forEach(el => {
        const check = groupingList.findIndex((element) => element.exercise_id === el.exercise_id)
        
        if(check >=0){
          groupingList[check].quantity = groupingList[check].quantity + el.quantity
        } else{
          groupingList.push(el)
        }
      })
      this.userActivities.set(groupingList)
    }

  }

  // SELECT BETWEEN DATE
  async fetchRangeActivities(startDate: Date, endDate: Date){
    const { data } = await this.supabaseService.supabase
    .from(ACTIVITIES)
    .select(`date, id, quantity, exercise_id,
      ${EXERCISES}( number_of_repetitions, ${BASIC_ACTIVITY_EXERCISE}( name, cal))`)
      .gte('date', this.pgFormatDate(startDate))
      .lte('date', this.pgFormatDate(endDate))
          
    if(data){
      this.userActivities.set(data)
    }
  }

  // INSERT
  async addActivity(activity: any){
    const activityDate = this.pgFormatDate(activity.date)        
    
    const addedIndex = this.userActivities().findIndex(el => (el.exercise_id === activity.exercise_id && el.date === activityDate))
    if(addedIndex >= 0){
      // already exist so update      
      const oldQuantity = this.userActivities()[addedIndex].quantity
      
      this.updateActivity({
        quantity: +oldQuantity + +activity.quantity
      }, this.userActivities()[addedIndex].id)
    } else{
      const { data, error } = await this.supabaseService.supabase
        .from(ACTIVITIES)
        .insert(activity)
        .select(`date, id, quantity, exercise_id,
        ${EXERCISES}( number_of_repetitions, ${BASIC_ACTIVITY_EXERCISE}( name, cal))`)
      if(data){
        this.fetchActivities()
        
      }
      if (error) {
        console.error(error.message);
      }
    }
  }

  // UPDATE
  async updateActivity(newVal: {}, id: string){
    const { data, error } = await this.supabaseService.supabase
      .from(ACTIVITIES)
      .update(newVal)
      .eq('id', id)
      .select(`date, id, quantity, exercise_id,
      ${EXERCISES}( number_of_repetitions, ${BASIC_ACTIVITY_EXERCISE}( name, cal))`)

    if(data){
      data.forEach((el)=>{
        const updated = el;
        const updatedIndex = this.userActivities().findIndex(el => el.id === updated.id)
        if(updatedIndex >= 0){
          let updatedUserActivities = this.userActivities()
          updatedUserActivities[updatedIndex] = el
          this.userActivities.set(updatedUserActivities)
        }
      })
    }
    
    if (error) {
      console.error(error.message);
    }  
  }

  // DELETE
  async deleteExercises(id: string){
    try{
      await this.supabaseService.supabase
        .from(ACTIVITIES)
        .delete()
        .eq('id', id)     
      
      const deletedIndex = this.loadedActivities().findIndex(el => el.id === id)
      if(deletedIndex >= 0){
        let updatedUserActivities = this.userActivities()
        updatedUserActivities.splice(deletedIndex, 1)
        this.userActivities.set(updatedUserActivities)
      }
    } catch(error){
      console.error(error)
    }
  }

  pgFormatDate(date:Date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d:number) {
      return ("0" + d).slice(-2)
    }
  
    var parsed = new Date(date)
  
    return [parsed.getUTCFullYear(), zeroPad(parsed.getMonth() + 1), zeroPad(parsed.getDate())].join("-");
  }
}
