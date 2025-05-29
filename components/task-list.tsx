"use client"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Trash2,
  Timer,
  Clock,
  Trash,
  ArchiveX,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Plus,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import type { SubTask } from "@/lib/types"
import { Input } from "@/components/ui/input"

export default function TaskList() {
  const {
    tasks,
    activeTaskId,
    removeTask,
    setActiveTask,
    completeTask,
    clearAllTasks,
    clearCompletedTasks,
    updateTaskEnergyLevel,
    completeSubtask,
    addSubtask,
  } = usePomodoro()

  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({})

  const incompleteTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  // Count completed subtasks for a task
  const getSubtaskProgress = (task: any) => {
    if (!task.subtasks || task.subtasks.length === 0) return null
    const completed = task.subtasks.filter((st: SubTask) => st.completed).length
    return `${completed}/${task.subtasks.length}`
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

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ArchiveX className="h-4 w-4 mr-1" /> Clear Completed
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all completed tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCompletedTasks}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all tasks?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all tasks, including active ones. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllTasks}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Current Tasks</h3>
            {incompleteTasks.length > 0 ? (
              <ul className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-md border ${
                      task.id === activeTaskId ? "bg-muted border-primary" : "border-border"
                    }`}
                  >
                    <div className="flex flex-col p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-grow-0">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={(checked) => completeTask(task.id, checked === true)}
                          />
                          <div className="flex items-center gap-2">
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
                              htmlFor={`task-${task.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {task.title}
                            </label>

                            {/* Show subtask count if any */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <Badge variant="outline" className="ml-1">
                                <ListTodo className="h-3 w-3 mr-1" />
                                {getSubtaskProgress(task)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {task.pomodorosCompleted}
                          </Badge>

                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(task.totalMinutes)}
                          </Badge>

                          {task.id !== activeTaskId ? (
                            <Button variant="ghost" size="sm" onClick={() => setActiveTask(task.id)}>
                              Focus
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setActiveTask(null)}>
                              Unfocus
                            </Button>
                          )}

                          <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

                      {/* Subtasks section */}
                      <div className={`mt-3 ml-8 space-y-2 ${expandedTasks[task.id] ? "block" : "hidden"}`}>
                        {task.subtasks &&
                          task.subtasks.length > 0 &&
                          task.subtasks.map((subtask) => (
                            <div
                              key={subtask.id}
                              className="flex items-center justify-between pl-6 pr-2 py-1 rounded-md bg-muted/30"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={`timer-subtask-${subtask.id}`}
                                  checked={subtask.completed}
                                  onCheckedChange={(checked) => completeSubtask(task.id, subtask.id, checked === true)}
                                />
                                <label
                                  htmlFor={`timer-subtask-${subtask.id}`}
                                  className={`text-sm leading-none ${subtask.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {subtask.title}
                                </label>
                              </div>
                            </div>
                          ))}

                        {/* Add new subtask input */}
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
              </ul>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No tasks yet. Add tasks in the Tasks tab!</div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Completed Tasks</h3>
              <ul className="space-y-2">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex flex-col rounded-md border border-border bg-muted/50">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => completeTask(task.id, checked === true)}
                        />
                        <div className="flex items-center gap-2">
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
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-medium leading-none line-through text-muted-foreground"
                          >
                            {task.title}
                          </label>

                          {/* Show subtask count if any */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <Badge variant="outline" className="ml-1">
                              <ListTodo className="h-3 w-3 mr-1" />
                              {getSubtaskProgress(task)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {task.pomodorosCompleted}
                        </Badge>

                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(task.totalMinutes)}
                        </Badge>

                        <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtasks section */}
                    <div className={`px-3 pb-3 ml-8 space-y-2 ${expandedTasks[task.id] ? "block" : "hidden"}`}>
                      {task.subtasks &&
                        task.subtasks.length > 0 &&
                        task.subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="flex items-center justify-between pl-6 pr-2 py-1 rounded-md bg-muted/30"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`completed-subtask-${subtask.id}`}
                                checked={subtask.completed}
                                onCheckedChange={(checked) => completeSubtask(task.id, subtask.id, checked === true)}
                              />
                              <label
                                htmlFor={`completed-subtask-${subtask.id}`}
                                className="text-sm leading-none line-through text-muted-foreground"
                              >
                                {subtask.title}
                              </label>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
