import { inject, Injectable } from '@angular/core';

import { SupabaseService } from '../supabase/supabase.service';
import { CHART, ChartInfo } from './chart.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  supabaseService = inject(SupabaseService)

  constructor() { }

  // SELECT
  async getDashboadCharts(){
    const { data } = await this.supabaseService.supabase
      .from(CHART)
      .select('name, exercise_id, is_range_absolute, range_type, show_in_dashboard')
      .eq('show_in_dashboard', true)
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
}
