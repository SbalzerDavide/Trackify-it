import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { BASIC_ENTITIES, BasicActivity } from './basic-activity.model';

@Injectable({
  providedIn: 'root'
})
export class BasicEntitiesService {
  
  private userBasicActivities = signal<BasicActivity[]>([]);
  loadedBasicActivities = this.userBasicActivities.asReadonly();

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async fetchBasicActivities(){   
    const { data } = await this.supabaseService.supabase
      .from(BASIC_ENTITIES)
      .select(`id, name, description, unit`)
    if(data){
      this.userBasicActivities.set(data)
    }
  }

  // INSERT
  async addBasicActivity(activity: {}){
    const { error } = await this.supabaseService.supabase
      .from(BASIC_ENTITIES)
      .insert(activity)

    if (error) {
      console.error(error.message);
    }
  }

  // UPDATE
  async updateBasicActivity(newVal: {}, id: string){
    const { error } = await this.supabaseService.supabase
      .from(BASIC_ENTITIES)
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
        .from(BASIC_ENTITIES)
        .delete()
        .eq('id', id)      
    } catch(error){
      console.error(error)
    }
  }


}
