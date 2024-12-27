export interface Entities {
  number_of_repetitions: number,
  basic_entities: {
    name: string,
    unit: number
  }
}

export const ENTITIES = 'entities'