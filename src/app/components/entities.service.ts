import { inject, Injectable, signal } from '@angular/core';
import { ENTITIES } from './entities.model';
import { SupabaseService } from '../shared/supabase/supabase.service';
import { BASIC_ENTITIES } from './basic-activity.model';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private userEntities = signal<any[]>([])
  loadedEntities = this.userEntities.asReadonly()

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async fetchEntities(){   
    const { data } = await this.supabaseService.supabase
      .from(ENTITIES)
      .select(`unit_value, id, name,
        ${BASIC_ENTITIES}( name, unit)`)
      
    if(data){
      this.userEntities.set(data)
    }
  }

  // INSERT
  async addEntity(activity:{}){        
    const { error } = await this.supabaseService.supabase
      .from(ENTITIES)
      .insert(activity)

    if (error) {
      console.error(error.message);
    }
  }

  // UPDATE
  async updateEntity(newVal: {}, id: string){
    const { error } = await this.supabaseService.supabase
      .from(ENTITIES)
      .update(newVal)
      .eq('id', id)

      if (error) {
        console.error(error.message);
      }  
  }

  // DELETE
  async deleteEntity(id: string){
    try{
      await this.supabaseService.supabase
        .from(ENTITIES)
        .delete()
        .eq('id', id)      
    } catch(error){
      console.error(error)
    }
  }


}
