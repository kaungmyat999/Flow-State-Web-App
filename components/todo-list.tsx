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
  ChevronDown,
  ChevronRight,
  ListTodo,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { SubTask } from "@/lib/types"

export default function TodoList() {
  const {
    tasks,
    addTask,
    completeTask,
    setActiveTask,
    activeTaskId,
    updateTaskEnergyLevel,
    removeTask,
    updateTask,
    addSubtask,
    updateSubtask,
    removeSubtask,
    completeSubtask,
  } = usePomodoro()

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskTitle, setEditingTaskTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  // State for subtask management
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({})
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("")
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const editSubtaskInputRef = useRef<HTMLInputElement>(null)

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingTaskId])

  // Focus the edit subtask input when editing starts
  useEffect(() => {
    if (editingSubtaskId && editSubtaskInputRef.current) {
      editSubtaskInputRef.current.focus()
    }
  }, [editingSubtaskId])

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

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleAddSubtask = (parentId: string) => {
    const title = newSubtaskTitle[parentId]?.trim()
    if (title) {
      addSubtask(parentId, title)
      setNewSubtaskTitle((prev) => ({
        ...prev,
        [parentId]: "",
      }))
      // Auto-expand the task when adding a subtask
      setExpandedTasks((prev) => ({
        ...prev,
        [parentId]: true,
      }))
    }
  }

  const startEditingSubtask = (parentId: string, subtask: SubTask) => {
    setEditingSubtaskId(subtask.id)
    setEditingSubtaskTitle(subtask.title)
  }

  const cancelEditingSubtask = () => {
    setEditingSubtaskId(null)
    setEditingSubtaskTitle("")
  }

  const saveEditingSubtask = (parentId: string) => {
    if (editingSubtaskId && editingSubtaskTitle.trim()) {
      updateSubtask(parentId, editingSubtaskId, { title: editingSubtaskTitle.trim() })
      setEditingSubtaskId(null)
      setEditingSubtaskTitle("")
    }
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

  // Count completed subtasks for a task
  const getSubtaskProgress = (task: any) => {
    if (!task.subtasks || task.subtasks.length === 0) return null
    const completed = task.subtasks.filter((st: SubTask) => st.completed).length
    return `${completed}/${task.subtasks.length}`
  }

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
                  <div key={task.id} className={`border rounded-md ${task.completed ? "bg-muted/50" : "bg-card"}`}>
                    <div className="flex flex-col p-3">
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
                            <div className="flex items-center gap-2 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-6 w-6"
                                onClick={() => toggleTaskExpanded(task.id)}
                              >
                                {expandedTasks[task.id] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <label
                                htmlFor={`todo-task-${task.id}`}
                                className={`text-sm font-medium leading-none ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </label>

                              {/* Show subtask count if any */}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <Badge variant="outline" className="ml-2">
                                  <ListTodo className="h-3 w-3 mr-1" />
                                  {getSubtaskProgress(task)}
                                </Badge>
                              )}
                            </div>
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

                      {/* Subtasks section - Always render but conditionally show */}
                      <div className={`mt-3 ml-8 space-y-2 ${expandedTasks[task.id] ? "block" : "hidden"}`}>
                        {/* Existing subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {task.subtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className="flex items-center justify-between pl-6 pr-2 py-1 rounded-md bg-muted/30"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <Checkbox
                                    id={`subtask-${subtask.id}`}
                                    checked={subtask.completed}
                                    onCheckedChange={(checked) =>
                                      completeSubtask(task.id, subtask.id, checked === true)
                                    }
                                  />

                                  {editingSubtaskId === subtask.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <Input
                                        ref={editSubtaskInputRef}
                                        value={editingSubtaskTitle}
                                        onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") saveEditingSubtask(task.id)
                                          if (e.key === "Escape") cancelEditingSubtask()
                                        }}
                                        className="h-7 text-sm"
                                      />
                                      <Button variant="ghost" size="sm" onClick={() => saveEditingSubtask(task.id)}>
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={cancelEditingSubtask}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <label
                                      htmlFor={`subtask-${subtask.id}`}
                                      className={`text-sm leading-none ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                                    >
                                      {subtask.title}
                                    </label>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Edit subtask button */}
                                  {editingSubtaskId !== subtask.id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => startEditingSubtask(task.id, subtask)}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  )}

                                  {/* Delete subtask button */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => removeSubtask(task.id, subtask.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add new subtask - Always visible when expanded */}
                        <div className="flex gap-2 pl-6">
                          <Input
                            placeholder="Add a subtask..."
                            value={newSubtaskTitle[task.id] || ""}
                            onChange={(e) =>
                              setNewSubtaskTitle((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSubtask(task.id)
                              }
                            }}
                            className="h-8 text-sm"
                          />
                          <Button size="sm" onClick={() => handleAddSubtask(task.id)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
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
