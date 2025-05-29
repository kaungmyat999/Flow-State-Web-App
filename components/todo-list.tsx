"use client"

import { useState, useRef, useEffect } from "react"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calendar,
  Plus,
  Timer,
  BatteryLow,
  BatteryMedium,
  Battery,
  BatteryFull,
  Pencil,
  Trash2,
  X,
  Check,
  CalendarIcon,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function TodoList() {
  const { tasks, addTask, completeTask, setActiveTask, activeTaskId, updateTaskEnergyLevel, removeTask, updateTask } =
    usePomodoro()
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingTaskId])

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), selectedDate)
      setNewTaskTitle("")
      setSelectedDate(undefined)
    }
  }

  const startEditing = (task: { id: string; title: string }) => {
    setEditingTaskId(task.id)
    setEditingTaskTitle(task.title)
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingTaskTitle("")
  }

  const saveEditing = () => {
    if (editingTaskId && editingTaskTitle.trim()) {
      updateTask(editingTaskId, { title: editingTaskTitle.trim() })
      setEditingTaskId(null)
      setEditingTaskTitle("")
    }
  }

  const updateTaskDueDate = (taskId: string, date: Date | undefined) => {
    updateTask(taskId, { dueDate: date })
  }

  // Group tasks by due date
  const tasksByDate = tasks.reduce(
    (groups, task) => {
      // Use due date if available, otherwise use created date
      const dateToUse = task.dueDate || task.createdAt
      const dateString = dateToUse.toLocaleDateString()

      if (!groups[dateString]) {
        groups[dateString] = []
      }
      groups[dateString].push(task)
      return groups
    },
    {} as Record<string, typeof tasks>,
  )

  // Sort dates in chronological order (upcoming dates first)
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask()
                }
              }}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Set due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                <span>{date}</span>
              </div>

              <div className="space-y-2">
                {tasksByDate[date].map((task) => (
                  <div
                    key={task.id}
                    className={`flex flex-col p-3 rounded-md border ${task.completed ? "bg-muted/50" : "bg-card"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          id={`todo-task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => completeTask(task.id, checked === true)}
                        />

                        {editingTaskId === task.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              ref={editInputRef}
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditing()
                                if (e.key === "Escape") cancelEditing()
                              }}
                              className="h-8"
                            />
                            <Button variant="ghost" size="sm" onClick={saveEditing}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`todo-task-${task.id}`}
                            className={`text-sm font-medium leading-none ${task.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </label>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.pomodorosCompleted > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {task.pomodorosCompleted}
                          </Badge>
                        )}

                        {/* Due date editor */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                              mode="single"
                              selected={task.dueDate}
                              onSelect={(date) => updateTaskDueDate(task.id, date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Edit button */}
                        {editingTaskId !== task.id && (
                          <Button variant="ghost" size="sm" onClick={() => startEditing(task)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete button */}
                        <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>

                        {/* Focus button */}
                        {task.id !== activeTaskId ? (
                          <Button variant="ghost" size="sm" onClick={() => setActiveTask(task.id)}>
                            Focus
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setActiveTask(null)}>
                            Unfocus
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Energy Level Selector */}
                    <div className="flex items-center gap-2 mt-2 ml-8">
                      <span className="text-xs text-muted-foreground">Energy Level:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <Button
                            key={level}
                            variant="ghost"
                            size="sm"
                            className={`p-1 h-6 w-6 ${task.energyLevel === level ? "bg-primary/20" : ""}`}
                            onClick={() => updateTaskEnergyLevel(task.id, level)}
                          >
                            {level === 1 && <BatteryLow className="h-4 w-4 text-red-500" />}
                            {level === 2 && <BatteryMedium className="h-4 w-4 text-yellow-500" />}
                            {level === 3 && <Battery className="h-4 w-4 text-green-500" />}
                            {level === 4 && <BatteryFull className="h-4 w-4 text-blue-500" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">No tasks yet. Add a task above to get started.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
