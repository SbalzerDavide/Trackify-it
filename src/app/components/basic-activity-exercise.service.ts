import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { BASIC_ACTIVITY_EXERCISE, BasicActivity } from './basic-activity.model';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BasicActivityExerciseService {
  
  private userBasicActivities = signal<BasicActivity[]>([]);
  loadedBasicActivities = this.userBasicActivities.asReadonly();

  supabaseService = inject(SupabaseService)
  authService = inject(AuthService)

  constructor() { }

  // SELECT
  async fetchBasicActivities(){   
    const { data } = await this.supabaseService.supabase
      .from(BASIC_ACTIVITY_EXERCISE)
      .select(`id, name, description, cal`)
      .eq('user_id', this.authService.session?.user.id)
    if(data){
      this.userBasicActivities.set(data)
    }
  }

  // INSERT
  async addBasicActivity(activity: {}){
    const { error } = await this.supabaseService.supabase
      .from(BASIC_ACTIVITY_EXERCISE)
      .insert(activity)

    if (error) {
      console.error(error.message);
    }
  }

  // UPDATE
  async updateBasicActivity(newVal: {}, id: string){
    const { error } = await this.supabaseService.supabase
      .from(BASIC_ACTIVITY_EXERCISE)
      .update(newVal)
      .eq('id', id)

      if (error) {
        console.error(error.message);
      }  
  }

  // DELETE
  async deleteBasicActivity(id: string){
    try{
      await this.supabaseService.supabase
        .from(BASIC_ACTIVITY_EXERCISE)
        .delete()
        .eq('id', id)      
    } catch(error){
      console.error(error)
    }
  }


}
