import { inject, Injectable } from '@angular/core';

import { SupabaseService } from '../supabase/supabase.service';
import { CHART, ChartInfo } from './chart.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  supabaseService = inject(SupabaseService)

  constructor() { }

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
