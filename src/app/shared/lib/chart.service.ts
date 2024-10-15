import { inject, Injectable } from '@angular/core';

import { SupabaseService } from '../supabase/supabase.service';
import { CHART, ChartInfo } from './chart.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  supabaseService = inject(SupabaseService)

  updateCharts : Subject<any> = new Subject


  constructor() { }

  // SELECT
  async getDashboadCharts(){
    const { data } = await this.supabaseService.supabase
      .from(CHART)
      .select('id, name, exercise_id, is_range_absolute, range_type, show_in_dashboard')
      .eq('show_in_dashboard', true)
      .order('created_at', { ascending: false })
    if(data){
      return data
    } else{
      return []
    }
  }

  // INSERT
  async addChart(chartInfo: ChartInfo){
    try{
      await this.supabaseService.supabase
        .from(CHART)
        .insert(chartInfo)
    } catch(error){
      console.error(error)
    }
  }  

  async updateChart(newVal: {}, id: string){
    const { error } = await this.supabaseService.supabase
      .from(CHART)
      .update(newVal)
      .eq('id', id)

      if (error) {
        console.error(error.message);
      }  
  }


}
