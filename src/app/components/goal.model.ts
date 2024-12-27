export interface Goal {
  quantity: number,
  range: string,
  id: string,
  entity_id: string, 
  entities: {
    basic_entities: {
      name: string
    },
    number_of_repetitions: number
  } 
}

export const GOAL = 'goal'
