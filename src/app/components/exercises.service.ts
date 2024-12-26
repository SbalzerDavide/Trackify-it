import { inject, Injectable, signal } from '@angular/core';
import { EXERCISES } from './exercises.model';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { BASIC_ENTITIES } from './basic-activity.model';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {
  private userExercises = signal<any[]>([])
  loadedExercises = this.userExercises.asReadonly()

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async fetchExercises(){   
    const { data } = await this.supabaseService.supabase
      .from(EXERCISES)
      .select(`number_of_repetitions, id, name,
        ${BASIC_ENTITIES}( name, unit)`)
      
    if(data){
      this.userExercises.set(data)
    }
  }

  // INSERT
  async addExercises(activity:{}){        
    const { error } = await this.supabaseService.supabase
      .from(EXERCISES)
      .insert(activity)

    if (error) {
      console.error(error.message);
    }
  }

  // UPDATE
  async updateExercises(newVal: {}, id: string){
    const { error } = await this.supabaseService.supabase
      .from(EXERCISES)
      .update(newVal)
      .eq('id', id)

      if (error) {
        console.error(error.message);
      }  
  }

  // DELETE
  async deleteExercises(id: string){
    try{
      await this.supabaseService.supabase
        .from(EXERCISES)
        .delete()
        .eq('id', id)      
    } catch(error){
      console.error(error)
    }
  }


}
