import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';

import { ActivityService } from '../activity.service';
import { CardComponent } from '../../shared/lib/card/card.component';
import { GoalStore } from '../goal.store';
import { ChartComponent } from '../../shared/lib/chart/chart.component';
import { FormatDataChartService } from '../format-data-chart.service';
import { ExercisesService } from '../exercises.service';
import { RangeBarComponent } from '../../shared/lib/range-bar/range-bar.component';
import { ChartFormattedData } from '../chart.model';
import { Range } from '../activity.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CardComponent,
    MatProgressSpinnerModule,
    ChartComponent,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    RangeBarComponent,
    MatSlideToggleModule,
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
})
export class ActivityComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  activityService = inject(ActivityService);
  formatDataChart = inject(FormatDataChartService);
  exerciseService = inject(ExercisesService);

  goalStore = inject(GoalStore);

  activeGoal = signal<any>({});
  rangeType = signal<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');
  loading = signal<boolean>(true);
  dataChart = signal<ChartFormattedData | null>(null);
  startRange = signal<Date>(new Date());
  endRange = signal<Date>(new Date());
  isRangeAbsolute = signal<boolean>(false);
  data = signal<any[]>([]);

  activeExerciseForm = new FormGroup({
    activeExercise: new FormControl('', {
      validators: [Validators.required],
    }),
    isRangeAbsolute: new FormControl(false),
  });

  exercises = computed(() => {
    return this.exerciseService.loadedExercises().map((el) => {
      return {
        value: el.id,
        label: el.basic_activity_exercise.name,
      };
    });
  });

  rangeGoalForChart = computed(() => {
    switch (this.rangeType()) {
      case 'daily':
        return 'daily';
      case 'weekly':
        return 'daily';
      case 'monthly':
        return 'daily';
      case 'annual':
        return 'monthly';
    }
  });

  loadedActivities = computed(() => {
    return this.activityService.getGroupingActivity(this.data());
  });

  async ngOnInit() {
    await this.fetchData();
    await this.exerciseService.fetchExercises();
    await this.goalStore.loadAll();
    this.loading.set(false);

    const subscriptionUpdateActivities =
      this.activityService.updateActivities.subscribe((val) => {
        this.fetchData().then(() => {
          this.formatDataForChart();
        });
      });

    const subscriptionForm = this.activeExerciseForm.valueChanges.subscribe({
      next: (val) => {
        let changeIsAbsolute: boolean;
        if (val.isRangeAbsolute === this.isRangeAbsolute()) {
          changeIsAbsolute = false;
        } else {
          changeIsAbsolute = true;
        }

        if (val.isRangeAbsolute !== undefined && val.isRangeAbsolute !== null) {
          this.isRangeAbsolute.set(val.isRangeAbsolute);
        }

        if (changeIsAbsolute) {
          this.endRange.set(new Date());
        }

        const range: Range = this.formatDataChart.updateRange(
          this.rangeType(),
          this.isRangeAbsolute(),
          this.endRange()
        );

        if (range.startRange) {
          this.startRange.set(range.startRange);
        }
        if (range.endRange) {
          this.endRange.set(range.endRange);
        }

        this.setActiveGoal();
      },
    });

    this.destroyRef.onDestroy(() => {
      subscriptionUpdateActivities.unsubscribe();
      subscriptionForm.unsubscribe();
    });
  }

  async onUpdateQuantity(e: number, index: number) {
    const realElementToUpdate = this.data().find(
      (el) =>
        el.exercise_id === this.loadedActivities()[index].exercise_id &&
        el.date === this.loadedActivities()[index].date
    );
    let newVal = {
      quantity: realElementToUpdate.quantity,
    };
    if (e === 1) {
      newVal.quantity++;
    } else if (e === 0) {
      newVal.quantity--;
    }

    if (newVal.quantity > 0) {
      await this.activityService.updateActivity(newVal, realElementToUpdate.id);
    } else {
      await this.activityService.deleteActivity(realElementToUpdate.id);
    }
    await this.fetchData();
  }

  async onChangeRange(rangeType: 'daily' | 'weekly' | 'monthly' | 'annual') {
    if (rangeType) {
      this.rangeType.set(rangeType);
    }
    this.endRange.set(new Date());
    const range: Range = this.formatDataChart.updateRange(
      this.rangeType(),
      this.isRangeAbsolute(),
      this.endRange()
    );

    if (range.startRange) {
      this.startRange.set(range.startRange);
    }
    if (range.endRange) {
      this.endRange.set(range.endRange);
    }
    this.setActiveGoal();
  }

  onChangeRangeVal(range: Range) {
    if (range.startRange) {
      this.startRange.set(range.startRange);
    }
    if (range.endRange) {
      this.endRange.set(range.endRange);
    }
    this.setActiveGoal();
  }

  setCardTitle(basicExercise: {
    name: string;
    number_of_repetitions: string;
    basic_activity_exercise: {
      cal: string;
      name: string;
    };
  }) {
    console.log(basicExercise);
    if(basicExercise.name){
      return basicExercise.name
    } else{
      return `${basicExercise.number_of_repetitions} x ${basicExercise.basic_activity_exercise.name}`;
    }
  }

  getValue(goalType: string, exerciseId: string) {
    return this.goalStore
      .goals()
      .find((el) => el.range === goalType && el.exercise_id === exerciseId);
  }

  private async fetchData() {
    const data = await this.activityService.fetchRangeActivities(
      this.startRange(),
      this.endRange()
    );
    this.data.set(data);
  }

  private async setActiveGoal() {
    const activeGoal = this.goalStore
      .goals()
      .filter((goal) => goal.range === this.rangeGoalForChart())
      .find(
        (goal) =>
          goal.exercise_id === this.activeExerciseForm.value.activeExercise
      );

    this.activeGoal.set(activeGoal);
    await this.fetchData();

    if (this.activeExerciseForm.value.activeExercise) {
      this.formatDataForChart();
    }
  }

  private formatDataForChart() {
    const filteredFromExercise = this.data().filter(
      (el) => el.exercise_id === this.activeExerciseForm.value.activeExercise!
    );

    this.dataChart.set(
      this.formatDataChart.formatData(
        filteredFromExercise,
        this.rangeType(),
        this.startRange(),
        this.endRange(),
        this.activeGoal()?.quantity
      )
    );
  }
}
