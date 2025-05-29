"use client"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Timer, Clock, Trash, ArchiveX, Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react"
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
  } = usePomodoro()

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
                  <li
                    key={task.id}
                    className={`flex flex-col p-3 rounded-md border ${
                      task.id === activeTaskId ? "bg-muted border-primary" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => completeTask(task.id, checked === true)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {task.title}
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
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
                  </li>
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
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={(checked) => completeTask(task.id, checked === true)}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm font-medium leading-none ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
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
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
