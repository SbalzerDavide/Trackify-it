export interface ChartInfo {
  name?: string,
  exercise_id: string | undefined,
  is_range_absolute?: Boolean,
  range_type: 'daily' | 'weekly' | 'monthly' | 'annual',
  show_in_dashboard?: boolean,
  startRange?: Date,
  endRange?: Date,
  data?: {
    type?: 'line' | 'bar', 
    xType?: 'value' | 'category' | 'time' | 'log',
    yType?: 'value' | 'category' | 'time' | 'log',
    xdata: string[],
    data?: any,
    goal: number | undefined
  } 
}

export const CHART = 'chart'