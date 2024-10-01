import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';

import { Goal } from './goal.model';
import { GoalService } from './goal.service';

interface GoalStateModel {
  goals: Goal[];
  isLoading: boolean;
};

const initialState: GoalStateModel = {
  goals: [],
  isLoading: false,
};

export const GoalStore = signalStore(
  withState(initialState),
  withMethods((store, goalService = inject(GoalService)) =>({
    async loadAll(){
      patchState(store, {isLoading: true})

      const goals = await goalService.getAll()
    
      patchState(store, {goals, isLoading: false})
    }
  }))
);