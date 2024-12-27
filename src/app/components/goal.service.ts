import { inject, Injectable, signal } from '@angular/core';

import { Goal, GOAL } from './goal.model';
import { ENTITIES } from './entities.model';
import { BASIC_ENTITIES } from './basic-activity.model';
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
        .select(`quantity, range, id, entity_id,
        ${ENTITIES}( number_of_repetitions, ${BASIC_ENTITIES}( name ))`)
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
  async addGoal(newVal: {range: string, entityId: string}){
    try{
      await this.supabaseService.supabase
        .from(GOAL)
        .insert({
          range: newVal.range,
          entity_id: newVal.entityId,
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
