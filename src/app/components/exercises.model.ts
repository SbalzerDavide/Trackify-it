export interface Exercises {
  number_of_repetitions: number,
  basic_activity_exercise: {
    name: string,
    cal: number
  }
}

export const EXERCISES = 'exercises'