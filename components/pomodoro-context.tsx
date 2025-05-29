"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"

interface Task {
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
}

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

interface PomodoroContextProps {
  pomodoroLength: number
  shortBreakLength: number
  longBreakLength: number
  alarmEnabled: boolean
  meditationDuration: number
  breathInDuration: number
  holdInDuration: number
  breathOutDuration: number
  holdOutDuration: number
}

interface PomodoroState {
  tasks: Task[]
  addTask: (title: string, dueDate?: Date) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  completeTask: (id: string, completed: boolean) => void
  updateTaskEnergyLevel: (id: string, energyLevel: number) => void
  activeTaskId: string | null
  setActiveTask: (id: string | null) => void
  clearAllTasks: () => void
  clearCompletedTasks: () => void
  timerStatus: "idle" | "running" | "paused"
  timerMode: TimerMode
  setTimerMode: React.Dispatch<React.SetStateAction<TimerMode>>
  timeRemaining: number
  settings: PomodoroContextProps
  updateSettings: (newSettings: Partial<PomodoroContextProps>) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  playAlarm: () => void
  addMeditationSession: (duration: number) => void
  history: {
    date: string
    totalPomodoros: number
    totalMinutes: number
    totalBreakMinutes: number
    totalMeditationMinutes: number
    tasksCompleted: number
  }[]
}

const defaultSettings: PomodoroContextProps = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  alarmEnabled: true,
  meditationDuration: 10,
  breathInDuration: 4,
  holdInDuration: 2,
  breathOutDuration: 6,
  holdOutDuration: 2,
}

const PomodoroContext = createContext<PomodoroState>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  removeTask: () => {},
  completeTask: () => {},
  updateTaskEnergyLevel: () => {},
  activeTaskId: null,
  setActiveTask: () => {},
  clearAllTasks: () => {},
  clearCompletedTasks: () => {},
  timerStatus: "idle",
  timerMode: "pomodoro",
  setTimerMode: () => {},
  timeRemaining: defaultSettings.pomodoroLength * 60,
  settings: defaultSettings,
  updateSettings: () => {},
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
  playAlarm: () => {},
  addMeditationSession: () => {},
  history: [],
})

const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const setActiveTask = (id: string | null) => {
    setActiveTaskId(id)

    // If setting a new active task, record the start time if it doesn't exist
    if (id) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === id && !task.startTime) {
            return {
              ...task,
              startTime: new Date(),
            }
          }
          return task
        }),
      )
    }
  }

  const [timerStatus, setTimerStatus] = useState<"idle" | "running" | "paused">("idle")
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro")
  const [timeRemaining, setTimeRemaining] = useState(defaultSettings.pomodoroLength * 60)
  const [settings, setSettings] = useState<PomodoroContextProps>(defaultSettings)
  const [history, setHistory] = useState<
    {
      date: string
      totalPomodoros: number
      totalMinutes: number
      totalBreakMinutes: number
      totalMeditationMinutes: number
      tasksCompleted: number
    }[]
  >([])

  useEffect(() => {
    let initialTime = 0
    switch (timerMode) {
      case "pomodoro":
        initialTime = settings.pomodoroLength * 60
        break
      case "shortBreak":
        initialTime = settings.shortBreakLength * 60
        break
      case "longBreak":
        initialTime = settings.longBreakLength * 60
        break
    }
    setTimeRemaining(initialTime)
  }, [timerMode, settings.pomodoroLength, settings.shortBreakLength, settings.longBreakLength])

  const addTask = (title: string, dueDate?: Date) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      completed: false,
      pomodorosCompleted: 0,
      totalMinutes: 0,
      totalBreakMinutes: 0,
      createdAt: new Date(),
      hasBeenCompletedBefore: false,
      dueDate,
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const completeTask = (id: string, completed: boolean) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed, hasBeenCompletedBefore: true } : task)))
  }

  const updateTaskEnergyLevel = (id: string, energyLevel: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, energyLevel } : task)))
  }

  const clearAllTasks = () => {
    setTasks([])
    setActiveTaskId(null)
  }

  const clearCompletedTasks = () => {
    setTasks(tasks.filter((task) => !task.completed))
  }

  const updateSettings = (newSettings: Partial<PomodoroContextProps>) => {
    setSettings({ ...settings, ...newSettings })
  }

  const startTimer = () => {
    setTimerStatus("running")
  }

  const pauseTimer = () => {
    setTimerStatus("paused")
  }

  const resetTimer = () => {
    setTimerStatus("idle")
    let resetTime = 0
    switch (timerMode) {
      case "pomodoro":
        resetTime = settings.pomodoroLength * 60
        break
      case "shortBreak":
        resetTime = settings.shortBreakLength * 60
        break
      case "longBreak":
        resetTime = settings.longBreakLength * 60
        break
    }
    setTimeRemaining(resetTime)
  }

  const playAlarm = () => {
    // Try using a simple HTML Audio element first (more reliable)
    try {
      const audio = new Audio()
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJXfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OWRgsRVqzn7axZFQdBmt7ywW4jBSyG0PPVhTQHHGy/7+WYSQ0PU6vm7q5bFwY+l93zxHElBCmDzvPYiDYIGWe77OihTBALT6bj8bdjHAY3kdfyzHosBSV2x/DdkEEKFF207OuoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jlkYLEVas5+2sWRUHQZre8sFuIwUshtDz1YU0BxxsvO/mmEkND1Or5u6uWxcGPpfd88RxJQQpg87z2Ig2CBlnu+zooUwQC0+m4/G3YxwGN5HX8sx6LAUldsfw3ZBBChRdtOzrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45ZGCxFWrOftq1kVB0Ga3vLBbiMFLIbQ89WFNAccbLzv5phJDQ9Tqvm7q5bFwY+l93zxHElBCmDzvPYiDYIGWe77OihTBALT6bj8bdjHAY3kdfyzHosBSV2x/HdkEEKFF207OuoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jlkYLEVas5+2sWRUHQZre8sFuIwUshtDz1YU0BxxsvO/mmEkND1Tqvm7q5bFwY+l93zxHElBCmDzvPYiDYIGWe77OihTBALT6bj8bdjHAY3kdfyzHosBSV2x/HdkEEKFF207OuoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jlkYLEVas5+2sWRUHQZre8sFuIwUshtDz1YU0BxxsvO/mmEkND1Tqvm7q5bFwY+l93zxHElBCmDzvPYiDYIGWe77OihTBALT6bj8bdjHAY3kdfyzHosBS"
      audio.volume = 0.5

      // Play the audio
      const playPromise = audio.play()

      // Modern browsers return a promise from audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Alarm sound played successfully using HTML Audio")
          })
          .catch((error) => {
            console.error("HTML Audio playback failed:", error)
            // Fall back to Web Audio API if HTML Audio fails
            playWithWebAudio()
          })
      }
    } catch (error) {
      console.error("Error with HTML Audio:", error)
      // Fall back to Web Audio API
      playWithWebAudio()
    }
  }

  // Helper function to play sound with Web Audio API
  const playWithWebAudio = () => {
    try {
      // Create a new AudioContext each time to avoid closed context issues
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        console.error("Web Audio API is not supported in this browser")
        return
      }

      const ctx = new AudioContextClass()

      // Create a sequence of beeps
      const currentTime = ctx.currentTime

      // Create multiple beeps with different frequencies
      const beepCount = 3
      const beepDuration = 0.2
      const pauseDuration = 0.1

      for (let i = 0; i < beepCount; i++) {
        // Create oscillator
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        // Set properties
        oscillator.type = "sine"
        oscillator.frequency.value = 800 + i * 200 // Increasing frequency for each beep

        // Connect nodes
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        // Schedule the beep
        const startTime = currentTime + i * (beepDuration + pauseDuration)
        const stopTime = startTime + beepDuration

        // Add fade in/out to avoid clicks
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01)
        gainNode.gain.setValueAtTime(0.5, stopTime - 0.01)
        gainNode.gain.linearRampToValueAtTime(0, stopTime)

        // Start and stop
        oscillator.start(startTime)
        oscillator.stop(stopTime)
      }

      // Close the context after the last beep to clean up
      setTimeout(
        () => {
          ctx.close().catch((err) => console.error("Error closing AudioContext:", err))
        },
        (beepCount * (beepDuration + pauseDuration) + 0.5) * 1000,
      )

      console.log("Alarm sound played successfully using Web Audio API")
    } catch (error) {
      console.error("Error playing alarm sound with Web Audio API:", error)
    }
  }

  const addMeditationSession = (duration: number) => {
    const today = new Date().toISOString().split("T")[0]
    setHistory((prevHistory) => {
      const existingDay = prevHistory.find((day) => day.date === today)
      if (existingDay) {
        return prevHistory.map((day) =>
          day.date === today
            ? {
                ...day,
                totalMeditationMinutes: (day.totalMeditationMinutes || 0) + duration,
              }
            : day,
        )
      } else {
        return [
          ...prevHistory,
          {
            date: today,
            totalPomodoros: 0,
            totalMinutes: 0,
            totalBreakMinutes: 0,
            totalMeditationMinutes: duration,
            tasksCompleted: 0,
          },
        ]
      }
    })
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (timerStatus === "running" && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      clearInterval(intervalId)
      playAlarm() // Play alarm when timer reaches zero

      // Update task stats if in pomodoro mode and a task is active
      if (timerMode === "pomodoro" && activeTaskId) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === activeTaskId) {
              return {
                ...task,
                pomodorosCompleted: task.pomodorosCompleted + 1,
                totalMinutes: task.totalMinutes + settings.pomodoroLength,
              }
            }
            return task
          }),
        )

        // Update history
        const today = new Date().toISOString().split("T")[0]
        setHistory((prevHistory) => {
          const existingDay = prevHistory.find((day) => day.date === today)
          const completedTasksToday = tasks.filter(
            (task) =>
              task.completed &&
              task.hasBeenCompletedBefore &&
              new Date(task.createdAt).toISOString().split("T")[0] === today,
          ).length

          if (existingDay) {
            return prevHistory.map((day) =>
              day.date === today
                ? {
                    ...day,
                    totalPomodoros: day.totalPomodoros + 1,
                    totalMinutes: day.totalMinutes + settings.pomodoroLength,
                    tasksCompleted: completedTasksToday,
                  }
                : day,
            )
          } else {
            return [
              ...prevHistory,
              {
                date: today,
                totalPomodoros: 1,
                totalMinutes: settings.pomodoroLength,
                totalBreakMinutes: 0,
                totalMeditationMinutes: 0,
                tasksCompleted: completedTasksToday,
              },
            ]
          }
        })
      } else if (timerMode === "shortBreak" || timerMode === "longBreak") {
        // Update history with break time
        const today = new Date().toISOString().split("T")[0]
        const breakDuration = timerMode === "shortBreak" ? settings.shortBreakLength : settings.longBreakLength

        setHistory((prevHistory) => {
          const existingDay = prevHistory.find((day) => day.date === today)
          if (existingDay) {
            return prevHistory.map((day) =>
              day.date === today
                ? {
                    ...day,
                    totalBreakMinutes: (day.totalBreakMinutes || 0) + breakDuration,
                  }
                : day,
            )
          } else {
            return [
              ...prevHistory,
              {
                date: today,
                totalPomodoros: 0,
                totalMinutes: 0,
                totalBreakMinutes: breakDuration,
                totalMeditationMinutes: 0,
                tasksCompleted: 0,
              },
            ]
          }
        })
      }

      setTimerStatus("idle")
      if (timerMode === "pomodoro") {
        setTimerMode("shortBreak")
        setTimeRemaining(settings.shortBreakLength * 60)
      } else if (timerMode === "shortBreak") {
        setTimerMode("pomodoro")
        setTimeRemaining(settings.pomodoroLength * 60)
      } else if (timerMode === "longBreak") {
        setTimerMode("pomodoro")
        setTimeRemaining(settings.pomodoroLength * 60)
      }
    }

    return () => clearInterval(intervalId)
  }, [timerStatus, timeRemaining, timerMode, settings, activeTaskId, tasks])

  const value: PomodoroState = {
    tasks,
    addTask,
    updateTask,
    removeTask,
    completeTask,
    updateTaskEnergyLevel,
    activeTaskId,
    setActiveTask,
    clearAllTasks,
    clearCompletedTasks,
    timerStatus,
    timerMode,
    setTimerMode,
    timeRemaining,
    settings,
    updateSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    playAlarm,
    addMeditationSession,
    history,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

const usePomodoro = () => {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}

export { PomodoroProvider, usePomodoro }
