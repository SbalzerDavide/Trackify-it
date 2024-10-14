export interface ChartInfo {
  name?: string,
  exercise_id: string | undefined,
  is_range_absolute?: Boolean,
  range_type: 'daily' | 'weekly' | 'monthly' | 'annual',
  show_in_dashboard?: boolean
}

export const CHART = 'chart'