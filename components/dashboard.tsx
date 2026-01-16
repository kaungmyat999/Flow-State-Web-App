"use client"

import { useState } from "react"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Clock, Timer, Coffee, Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Calendar } from "lucide-react"

type SortAttribute = "totalMinutes" | "pomodorosCompleted" | "energyLevel" | "createdAt"

export default function Dashboard() {
  const { tasks, history } = usePomodoro()
  const [timelineView, setTimelineView] = useState<"daily" | "weekly" | "yearly">("weekly")
  const [sortAttribute, setSortAttribute] = useState<SortAttribute>("totalMinutes")

  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Prepare chart data based on selected timeline
  const getChartData = () => {
    if (timelineView === "daily") {
      // Return last 7 days
      return sortedHistory.slice(0, 7).reverse()
    } else if (timelineView === "weekly") {
      // Group by week
      const weeklyData: Record<string, any> = {}
      sortedHistory.forEach((day) => {
        const date = new Date(day.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split("T")[0]

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: `Week of ${weekKey}`,
            totalPomodoros: 0,
            totalMinutes: 0,
            totalBreakMinutes: 0,
            totalMeditationMinutes: 0,
            tasksCompleted: 0,
          }
        }

        weeklyData[weekKey].totalPomodoros += day.totalPomodoros
        weeklyData[weekKey].totalMinutes += day.totalMinutes
        weeklyData[weekKey].totalBreakMinutes += day.totalBreakMinutes || 0
        weeklyData[weekKey].totalMeditationMinutes += day.totalMeditationMinutes || 0
        weeklyData[weekKey].tasksCompleted += day.tasksCompleted
      })

      return Object.values(weeklyData).slice(0, 10).reverse()
    } else {
      // Group by month/year
      const yearlyData: Record<string, any> = {}
      sortedHistory.forEach((day) => {
        const date = new Date(day.date)
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

        if (!yearlyData[yearMonth]) {
          yearlyData[yearMonth] = {
            date: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
            totalPomodoros: 0,
            totalMinutes: 0,
            totalBreakMinutes: 0,
            totalMeditationMinutes: 0,
            tasksCompleted: 0,
          }
        }

        yearlyData[yearMonth].totalPomodoros += day.totalPomodoros
        yearlyData[yearMonth].totalMinutes += day.totalMinutes
        yearlyData[yearMonth].totalBreakMinutes += day.totalBreakMinutes || 0
        yearlyData[yearMonth].totalMeditationMinutes += day.totalMeditationMinutes || 0
        yearlyData[yearMonth].tasksCompleted += day.tasksCompleted
      })

      return Object.values(yearlyData).slice(0, 12).reverse()
    }
  }

  // Filter history based on selected timeline
  const getFilteredHistory = () => {
    if (timelineView === "daily") {
      // Return last 7 days
      return sortedHistory.slice(0, 7)
    } else if (timelineView === "weekly") {
      // Return last 4 weeks (approximately a month)
      return sortedHistory.slice(0, 28)
    } else {
      // Return last 12 months
      return sortedHistory
    }
  }

  // Get top tasks filtered by timeline and sorted by selected attribute
  const getTopTasks = () => {
    // Filter tasks based on timeline
    const filteredTasks = [...tasks]

    if (timelineView === "daily") {
      // Tasks with activity in the last day
      const today = new Date().toISOString().split("T")[0]
      return filteredTasks
        .filter((task) => {
          // Check if task has activity today
          const taskDate = new Date(task.createdAt).toISOString().split("T")[0]
          return taskDate === today || task.pomodorosCompleted > 0
        })
        .sort((a, b) => {
          // Sort by the selected attribute
          if (sortAttribute === "createdAt") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return (b[sortAttribute] || 0) - (a[sortAttribute] || 0)
        })
        .slice(0, 5)
    } else if (timelineView === "weekly") {
      // Tasks with activity in the last week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      return filteredTasks
        .filter((task) => {
          // Check if task was created in the last week or has activity
          return new Date(task.createdAt) >= oneWeekAgo || task.pomodorosCompleted > 0
        })
        .sort((a, b) => {
          // Sort by the selected attribute
          if (sortAttribute === "createdAt") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return (b[sortAttribute] || 0) - (a[sortAttribute] || 0)
        })
        .slice(0, 5)
    } else {
      // All tasks, sorted by selected attribute
      return filteredTasks
        .sort((a, b) => {
          // Sort by the selected attribute
          if (sortAttribute === "createdAt") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          }
          return (b[sortAttribute] || 0) - (a[sortAttribute] || 0)
        })
        .slice(0, 5)
    }
  }

  const chartData = getChartData()
  const filteredHistory = getFilteredHistory()
  const topTasks = getTopTasks()

  // Calculate total stats
  const totalPomodoros = history.reduce((sum, day) => sum + day.totalPomodoros, 0)
  const totalTasksCompleted = history.reduce((sum, day) => sum + day.tasksCompleted, 0)
  const totalMinutes = history.reduce((sum, day) => sum + day.totalMinutes, 0)
  const totalBreakMinutes = history.reduce((sum, day) => sum + (day.totalBreakMinutes || 0), 0)
  const totalMeditationMinutes = history.reduce((sum, day) => sum + (day.totalMeditationMinutes || 0), 0)

  // Format time function
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
    }
  }

  // Timeline selector component for reuse
  const TimelineSelector = () => (
    <Select value={timelineView} onValueChange={(value) => setTimelineView(value as any)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select timeline" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="yearly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(totalMinutes)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across {totalPomodoros} pomodoros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasksCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasks.filter((t) => !t.completed).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meditation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(totalMeditationMinutes)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Activity Chart</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Your focus time over time</CardDescription>
              </div>
              <TimelineSelector />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "totalMinutes") return [`${value} min`, "Focus Time"]
                          if (name === "totalBreakMinutes") return [`${value} min`, "Break Time"]
                          return [value, name === "totalPomodoros" ? "Pomodoros" : "Tasks Completed"]
                        }}
                      />
                      <Legend />
                      <Bar dataKey="totalMinutes" name="Focus Time (min)" fill="#8884d8" />
                      <Bar dataKey="totalBreakMinutes" name="Break Time (min)" fill="#82ca9d" />
                      <Bar dataKey="totalMeditationMinutes" name="Meditation (min)" fill="#ffc658" />
                      <Bar dataKey="totalPomodoros" name="Pomodoros" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available yet. Complete some pomodoros!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily History</CardTitle>
                <CardDescription>Your pomodoro history by day</CardDescription>
              </div>
              <TimelineSelector />
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((day) => (
                    <div key={day.date} className="flex items-center justify-between border-b pb-2">
                      <div className="font-medium">{day.date}</div>
                      <div className="flex gap-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Focus Time:</span> {formatTime(day.totalMinutes)}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Break Time:</span>{" "}
                          {formatTime(day.totalBreakMinutes || 0)}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Meditation:</span>{" "}
                          {formatTime(day.totalMeditationMinutes || 0)}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Pomodoros:</span> {day.totalPomodoros}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Tasks:</span> {day.tasksCompleted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No history available yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Your tasks organized by date</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Sort tasks</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortAttribute("totalMinutes")}>Focus Time</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortAttribute("pomodorosCompleted")}>
                      Pomodoros
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortAttribute("energyLevel")}>Energy Level</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortAttribute("createdAt")}>Date Created</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TimelineSelector />
              </div>
            </CardHeader>
            <CardContent>
              {topTasks.length > 0 ? (
                <div className="space-y-6">
                  {/* Group tasks by date */}
                  {(() => {
                    // Group tasks by date
                    const tasksByDate = topTasks.reduce(
                      (groups, task) => {
                        const date = new Date(task.createdAt).toLocaleDateString()
                        if (!groups[date]) {
                          groups[date] = []
                        }
                        groups[date].push(task)
                        return groups
                      },
                      {} as Record<string, any>,
                    )

                    // Sort dates in reverse chronological order
                    return Object.entries(tasksByDate)
                      .sort(([dateA], [dateB]) => {
                        return new Date(dateB).getTime() - new Date(dateA).getTime()
                      })
                      .map(([date, tasks]) => (
                        <div key={date} className="space-y-4">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                          </div>

                          {tasks.map((task: any) => (
                            <div key={task.id} className="flex flex-col space-y-2 border-b pb-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-lg">{task.title}</div>
                                <Badge variant={task.completed ? "outline" : "secondary"}>
                                  {task.completed ? "Completed" : "Active"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="text-muted-foreground">Focus Time:</span>
                                    <div className="font-medium">{formatTime(task.totalMinutes)}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <Coffee className="h-4 w-4 text-green-500" />
                                  <div>
                                    <span className="text-muted-foreground">Break Time:</span>
                                    <div className="font-medium">{formatTime(task.totalBreakMinutes || 0)}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <Timer className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="text-muted-foreground">Pomodoros:</span>
                                    <div className="font-medium">{task.pomodorosCompleted}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  {task.energyLevel ? (
                                    <>
                                      {task.energyLevel === 1 && <BatteryLow className="h-4 w-4 text-red-500" />}
                                      {task.energyLevel === 2 && <BatteryMedium className="h-4 w-4 text-yellow-500" />}
                                      {task.energyLevel === 3 && <Battery className="h-4 w-4 text-green-500" />}
                                      {task.energyLevel === 4 && <BatteryFull className="h-4 w-4 text-blue-500" />}
                                      <div>
                                        <span className="text-muted-foreground">Energy:</span>
                                        <div className="font-medium">Level {task.energyLevel}</div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-muted-foreground">
                                      Created:{" "}
                                      {new Date(task.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Task timing information */}
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Started:</span>{" "}
                                  {task.startTime
                                    ? new Date(task.startTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Not started yet"}
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                  <span className="font-medium">Completed:</span>{" "}
                                  {task.endTime
                                    ? new Date(task.endTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "In progress"}
                                </div>
                              </div>

                              {/* Progress bar showing percentage of total time */}
                              {totalMinutes > 0 && (
                                <div className="w-full mt-1">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {Math.round((task.totalMinutes / totalMinutes) * 100)}% of total focus time
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary rounded-full h-2"
                                      style={{ width: `${(task.totalMinutes / totalMinutes) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))
                  })()}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No tasks completed yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
