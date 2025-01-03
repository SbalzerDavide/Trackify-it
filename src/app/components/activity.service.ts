import { inject, Injectable, signal } from '@angular/core';

import { SupabaseService } from '../shared/supabase/supabase.service';
import { ACTIVITIES } from './activity.model';
import { ENTITIES } from './entities.model';
import { BASIC_ENTITIES } from './basic-activity.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private userActivities = signal<any[]>([]);
  private allActivities = signal<any[]>([]);
  loadedActivities = this.userActivities.asReadonly();
  loadedAllActivities = this.allActivities.asReadonly();

  updateActivities: Subject<any> = new Subject();

  startRange = signal<Date>(new Date());
  endRange = signal<Date>(new Date());

  supabaseService = inject(SupabaseService);

  constructor() {}

  // SELECT
  async fetchFilteredActivities(
    entityId: string,
    startDate: Date,
    endDate: Date
  ) {
    const { data } = await this.supabaseService.supabase
      .from(ACTIVITIES)
      .select(
        `date, id, quantity, entity_id,
        ${ENTITIES}( unit_value, ${BASIC_ENTITIES}( name, unit))`
      )
      .gte('date', this.pgFormatDate(startDate))
      .lte('date', this.pgFormatDate(endDate))
      .eq('entity_id', entityId)
      .order('date', { ascending: true });
    if (data) {
      return data;
    } else {
      return [];
    }
  }

  // SELECT BETWEEN DATE
  async fetchRangeActivities(startDate: Date, endDate: Date) {
    const { data } = await this.supabaseService.supabase
      .from(ACTIVITIES)
      .select(
        `date, id, quantity, entity_id,
        ${ENTITIES}( unit_value, name, ${BASIC_ENTITIES}( name, unit))`
      )
      .gte('date', this.pgFormatDate(startDate))
      .lte('date', this.pgFormatDate(endDate))
      .order('date', { ascending: true })
      .order('id', { ascending: true });

    if (data) {
      return data;
    } else {
      return [];
    }
  }

  // INSERT
  async addActivity(activity: any) {
    const activityDate = this.pgFormatDate(activity.date);
    activity.date = activityDate;

    const { error } = await this.supabaseService.supabase
      .from(ACTIVITIES)
      .insert(activity).select(`date, id, quantity, entity_id,
      ${ENTITIES}( unit_value, ${BASIC_ENTITIES}( name, unit))`);
    if (error) {
      console.error(error.message);
    }
  }

  // UPDATE
  async updateActivity(newVal: {}, id: string) {
    const { data, error } = await this.supabaseService.supabase
      .from(ACTIVITIES)
      .update(newVal)
      .eq('id', id).select(`date, id, quantity, entity_id,
      ${ENTITIES}( unit_value, ${BASIC_ENTITIES}( name, unit))`);

    if (data) {
      // update local data
      // data.forEach((el)=>{
      //   const updated = el;
      //   const updatedIndex = this.userActivities().findIndex(el => el.id === updated.id)
      //   if(updatedIndex >= 0){
      //     let updatedUserActivities = this.userActivities()
      //     updatedUserActivities[updatedIndex] = el
      //     this.userActivities.set(updatedUserActivities)
      //   }
      // })
    }

    if (error) {
      console.error(error.message);
    }
  }

  // DELETE
  async deleteActivity(id: string) {
    try {
      await this.supabaseService.supabase
        .from(ACTIVITIES)
        .delete()
        .eq('id', id);

      // update local data
      // const deletedIndex = this.loadedActivities().findIndex(el => el.id === id)
      // if(deletedIndex >= 0){
      //   let updatedUserActivities = this.userActivities()
      //   updatedUserActivities.splice(deletedIndex, 1)
      //   this.userActivities.set(updatedUserActivities)
      // }
    } catch (error) {
      console.error(error);
    }
  }

  getGroupingActivity(data: any[]) {
    let groupingList: any[] = [];
    data.forEach((el) => {
      const check = groupingList.findIndex(
        (element) => element.entity_id === el.entity_id
      );

      if (check >= 0) {
        groupingList[check].quantity =
          groupingList[check].quantity + el.quantity;
      } else {
        groupingList.push({ ...el });
      }
    });
    return groupingList;
  }

  private pgFormatDate(date: Date) {
    /* Via http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date */
    function zeroPad(d: number) {
      return ('0' + d).slice(-2);
    }

    var parsed = new Date(date);

    return [
      parsed.getUTCFullYear(),
      zeroPad(parsed.getMonth() + 1),
      zeroPad(parsed.getDate()),
    ].join('-');
  }
}
