import { inject, Injectable, signal } from '@angular/core';

import { Goal, GOAL } from './goal.model';
import { EXERCISES } from './exercises.model';
import { BASIC_ACTIVITY_EXERCISE } from './basic-activity.model';
import { SupabaseService } from '../shared/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async getAll(){
    try{
      const { data } = await this.supabaseService.supabase
        .from(GOAL)
        .select(`quantity, range, id, exercise_id,
        ${EXERCISES}( number_of_repetitions, ${BASIC_ACTIVITY_EXERCISE}( name ))`)
        .returns<Goal[]>()
      
      if(data){
        return data
      } else{
        return []
      }
    } catch(error){
      console.error(error)
      return []
    }
  }

  // INSERT
  async addGoal(newVal: {range: string, exerciseId: string}){
    try{
      await this.supabaseService.supabase
        .from(GOAL)
        .insert({
          range: newVal.range,
          exercise_id: newVal.exerciseId,
          quantity: 1
        })
    } catch(error){
      console.error(error)
    }
  }

  // UPDATE
  async updateGoal(newVal:{quantity: number, range: string}, id: string){
    try{
      await this.supabaseService.supabase
        .from(GOAL)
        .update({
          range: newVal.range,
          quantity: newVal.quantity
        })
        .eq('id', id)


    } catch(error){
      console.error(error)
    }
  }

}
