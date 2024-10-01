export interface Goal {
  quantity: number,
  range: string,
  id: string,
  exercise_id: string, 
  exercises: {
    basic_activity_exercise: {
      name: string
    },
    number_of_repetitions: number
  } 
}

export const GOAL = 'goal'
