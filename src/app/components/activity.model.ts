// export interface Activity {
//   date: string, 
//   exercises_id: string,
//   entities: {},
//   id: string,
//   quantity: number
// }
export interface Range {
  startRange: Date | null,
  endRange: Date | null
}

export const ACTIVITIES = 'activities'