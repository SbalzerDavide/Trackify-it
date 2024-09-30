// import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
// import { Activity } from './activity-model';
// import { inject } from '@angular/core';
// import { ActivityService } from './activity.service';

// interface ActivityStateModel {
//   activities: Activity[];
//   isLoading: boolean;
//   startRange: Date, 
//   endRange: Date, 
// };

// const initialState: ActivityStateModel = {
//   activities: [],
//   isLoading: false,
//   startRange: new Date(),
//   endRange: new Date(),
// };

// export const ActivityStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialState),
//   withMethods((store, activityService = inject(ActivityService)) =>({
//     async loadAll(){
//       patchState(store, {isLoading: true})
//       await activityService.fetchActivities()
//       patchState(store, {isLoading: false})
//     }
//   }))
// );