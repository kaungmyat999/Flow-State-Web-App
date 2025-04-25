export interface Task {
  id: string
  title: string
  completed: boolean
  pomodorosCompleted: number
  totalMinutes: number
  totalBreakMinutes: number
  createdAt: Date
  hasBeenCompletedBefore: boolean
  energyLevel?: number
  startTime?: Date
  endTime?: Date
}
