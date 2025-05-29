"use client"

import { usePomodoro, type TimerMode } from "@/components/pomodoro-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function Timer() {
  const {
    timerMode,
    timerStatus,
    timeRemaining,
    setTimerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tasks,
    activeTaskId,
    playAlarm,
  } = usePomodoro()

  const [displayTime, setDisplayTime] = useState("00:00")

  // Format time remaining for display
  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    setDisplayTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
  }, [timeRemaining])

  // Get active task title
  const activeTask = tasks.find((task) => task.id === activeTaskId)

  // Determine timer color based on mode
  const getTimerColor = () => {
    switch (timerMode) {
      case "pomodoro":
        return "text-red-500 dark:text-red-400"
      case "shortBreak":
        return "text-green-500 dark:text-green-400"
      case "longBreak":
        return "text-blue-500 dark:text-blue-400"
      default:
        return ""
    }
  }

  // Handle test sound button click
  const handleTestSound = () => {
    // Initialize audio context if needed (must be triggered by user interaction)
    playAlarm()
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <Tabs value={timerMode} onValueChange={(value) => setTimerMode(value as TimerMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col items-center justify-center mt-8 mb-6">
          <div className={`text-7xl font-bold tabular-nums mb-8 ${getTimerColor()}`}>{displayTime}</div>

          {activeTask ? (
            <div className="text-lg font-medium mb-6 text-center">
              Working on: <span className="font-bold">{activeTask.title}</span>
            </div>
          ) : (
            <div className="text-lg text-muted-foreground mb-6 text-center">No active task selected</div>
          )}

          <div className="flex gap-4">
            {timerStatus === "running" ? (
              <Button size="lg" onClick={pauseTimer}>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button size="lg" onClick={startTimer} disabled={!activeTask && timerMode === "pomodoro"}>
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            )}

            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>

            <Button size="sm" variant="ghost" onClick={handleTestSound} title="Test alarm sound">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
