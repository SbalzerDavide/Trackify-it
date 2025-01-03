export interface Goal {
  quantity: number,
  range: string,
  id: string,
  entity_id: string, 
  entities: {
    basic_entities: {
      name: string
    },
    unit_value: number
  } 
}

export const GOAL = 'goal'
