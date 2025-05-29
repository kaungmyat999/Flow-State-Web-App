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
  dueDate?: Date
  subtasks?: SubTask[]
  parentId?: string
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  parentId: string
}
