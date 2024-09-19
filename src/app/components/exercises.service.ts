import { inject, Injectable, signal } from '@angular/core';
import { EXERCISES, Exercises } from './exercises.model';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { AuthService } from '../shared/auth/auth.service';
import { BASIC_ACTIVITY_EXERCISE } from './basic-activity.model';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {
  // private userExercises = signal<Exercises[]>([])
  private userExercises = signal<any[]>([])
  loadedExercises = this.userExercises.asReadonly()

  supabaseService = inject(SupabaseService)
  authService = inject(AuthService)

  constructor() { }

  async fetchExercises(){   
    const { data } = await this.supabaseService.supabase
      .from(EXERCISES)
      .select(`number_of_repetitions, 
        ${BASIC_ACTIVITY_EXERCISE}( name, cal)`)
        .eq('user_id', this.authService.session?.user.id)
      
    if(data){
      this.userExercises.set(data)
    }
  }

  // INSERT
  async addExercises(activity:{}){
    console.log("add");
    
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
