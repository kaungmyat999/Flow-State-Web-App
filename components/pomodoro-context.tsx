"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak"
export type TimerStatus = "idle" | "running" | "paused" | "completed"

export interface Task {
  id: string
  title: string
  completed: boolean
  pomodorosCompleted: number
  totalMinutes: number
  totalBreakMinutes: number // Added to track break time
  createdAt: Date
  dueDate?: Date // Added for task scheduling
  hasBeenCompletedBefore: boolean
  energyLevel?: number // Added to track energy level (1-4)
  startTime?: Date // Added to track when the task was first focused on
  endTime?: Date // Added to track when the task was completed
}

export interface Settings {
  pomodoroLength: number
  shortBreakLength: number
  longBreakLength: number
  alarmEnabled: boolean
  // Add meditation settings
  meditationDuration: number
  breathInDuration: number
  holdInDuration: number
  breathOutDuration: number
  holdOutDuration: number
}

// Add meditation tracking to PomodoroHistory interface
export interface PomodoroHistory {
  date: string
  tasksCompleted: number
  totalPomodoros: number
  totalMinutes: number
  totalBreakMinutes: number
  totalMeditationMinutes: number // Added to track meditation time
}

// Add meditation tracking function to PomodoroContextType
interface PomodoroContextType {
  // Timer state
  timerMode: TimerMode
  timerStatus: TimerStatus
  timeRemaining: number
  setTimerMode: (mode: TimerMode) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  playAlarm: () => void // Added explicit function to play alarm

  // Tasks
  tasks: Task[]
  activeTaskId: string | null
  addTask: (title: string, dueDate?: Date) => void // Updated to include dueDate
  updateTask: (id: string, updates: Partial<Task>) => void // Added for task editing
  removeTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  completeTask: (id: string, completed: boolean) => void
  incrementPomodoroCount: (id: string, minutes: number) => void
  incrementBreakTime: (id: string, minutes: number) => void // Added to track break time
  clearAllTasks: () => void
  clearCompletedTasks: () => void
  updateTaskEnergyLevel: (id: string, level: number) => void // Added to update energy level

  // Settings
  settings: Settings
  updateSettings: (newSettings: Settings) => void

  // History
  history: PomodoroHistory[]

  // Add meditation tracking
  addMeditationSession: (minutes: number) => void
}

const defaultSettings: Settings = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  alarmEnabled: true,
  // Default meditation settings
  meditationDuration: 10,
  breathInDuration: 4,
  holdInDuration: 2,
  breathOutDuration: 6,
  holdOutDuration: 2,
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

// Update the PomodoroProvider component to include meditation tracking
export function PomodoroProvider({ children }: { children: ReactNode }) {
  // Timer state
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro")
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle")
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [lastActiveTaskId, setLastActiveTaskId] = useState<string | null>(null)

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  // Settings state
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // History state
  const [history, setHistory] = useState<PomodoroHistory[]>([])

  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null)

  // Function to play alarm sound using Web Audio API
  const playAlarm = () => {
    if (!settings.alarmEnabled) return

    try {
      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContextClass) {
          console.error("Web Audio API is not supported in this browser")
          return
        }
        audioContextRef.current = new AudioContextClass()
      }

      // Resume audio context if it's suspended (needed for some browsers)
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      // Create a sequence of beeps
      const playBeepSequence = () => {
        const ctx = audioContextRef.current
        if (!ctx) return

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
      }

      // Play the beep sequence
      playBeepSequence()

      console.log("Alarm sound played successfully using Web Audio API")
    } catch (error) {
      console.error("Error playing alarm sound:", error)
    }
  }

  // Initialize timer based on mode
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

    // Clear any existing interval when mode changes
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

    setTimerStatus("idle")
  }, [timerMode, settings])

  // Timer functions
  const startTimer = () => {
    if (timerStatus === "running") return

    setTimerStatus("running")

    // If starting a break timer, store the current active task ID
    if (timerMode !== "pomodoro" && activeTaskId) {
      setLastActiveTaskId(activeTaskId)
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setIntervalId(interval)
  }

  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
    setTimerStatus("paused")
  }

  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }

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
    setTimerStatus("idle")
  }

  const handleTimerComplete = () => {
    setTimerStatus("completed")

    // Play alarm sound
    playAlarm()

    // Update task and history based on timer mode
    const today = new Date().toISOString().split("T")[0]

    if (timerMode === "pomodoro" && activeTaskId) {
      // A pomodoro was completed
      incrementPomodoroCount(activeTaskId, settings.pomodoroLength)

      // Update history for pomodoro
      setHistory((prev) => {
        const existingEntry = prev.find((entry) => entry.date === today)

        if (existingEntry) {
          return prev.map((entry) =>
            entry.date === today
              ? {
                  ...entry,
                  totalPomodoros: entry.totalPomodoros + 1,
                  totalMinutes: entry.totalMinutes + settings.pomodoroLength,
                }
              : entry,
          )
        } else {
          return [
            ...prev,
            {
              date: today,
              tasksCompleted: 0,
              totalPomodoros: 1,
              totalMinutes: settings.pomodoroLength,
              totalBreakMinutes: 0,
              totalMeditationMinutes: 0,
            },
          ]
        }
      })
    } else if (timerMode !== "pomodoro" && lastActiveTaskId) {
      // A break was completed
      const breakMinutes = timerMode === "shortBreak" ? settings.shortBreakLength : settings.longBreakLength
      incrementBreakTime(lastActiveTaskId, breakMinutes)

      // Update history for break
      setHistory((prev) => {
        const existingEntry = prev.find((entry) => entry.date === today)

        if (existingEntry) {
          return prev.map((entry) =>
            entry.date === today
              ? {
                  ...entry,
                  totalBreakMinutes: (entry.totalBreakMinutes || 0) + breakMinutes,
                }
              : entry,
          )
        } else {
          return [
            ...prev,
            {
              date: today,
              tasksCompleted: 0,
              totalPomodoros: 0,
              totalMinutes: 0,
              totalBreakMinutes: breakMinutes,
              totalMeditationMinutes: 0,
            },
          ]
        }
      })
    }

    // Auto switch to the next mode
    if (timerMode === "pomodoro") {
      setTimerMode("shortBreak")
    } else {
      setTimerMode("pomodoro")
    }
  }

  // Task functions
  const addTask = (title: string, dueDate?: Date) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      pomodorosCompleted: 0,
      totalMinutes: 0,
      totalBreakMinutes: 0, // Initialize break time
      createdAt: new Date(),
      dueDate, // Add due date
      hasBeenCompletedBefore: false,
      energyLevel: undefined, // Initialize energy level as undefined
      startTime: undefined,
      endTime: undefined,
    }

    setTasks((prev) => [...prev, newTask])

    // If no active task, set this as active
    if (activeTaskId === null) {
      setActiveTaskId(newTask.id)
    }
  }

  // Add new function to update task
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return { ...task, ...updates }
        }
        return task
      }),
    )
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))

    // If removing active task, set next task as active or null
    if (activeTaskId === id) {
      const remainingTasks = tasks.filter((task) => task.id !== id && !task.completed)
      setActiveTaskId(remainingTasks.length > 0 ? remainingTasks[0].id : null)
    }

    // Also clear lastActiveTaskId if it matches
    if (lastActiveTaskId === id) {
      setLastActiveTaskId(null)
    }
  }

  const setActiveTask = (id: string | null) => {
    setActiveTaskId(id)

    // If setting a new active task, record the start time if it doesn't exist
    if (id) {
      setTasks((prev) =>
        prev.map((task) => {
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

  const completeTask = (id: string, completed: boolean) => {
    // Get the task before updating
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    // Update the task in the tasks array
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            completed,
            // Add end time when completing a task
            endTime: completed ? new Date() : undefined,
            // Only update hasBeenCompletedBefore if we're completing the task for the first time
            hasBeenCompletedBefore: completed ? true : task.hasBeenCompletedBefore,
          }
        }
        return task
      }),
    )

    // Update the history based on completion status change
    const today = new Date().toISOString().split("T")[0]

    if (completed) {
      // Task is being completed - always increment the counter
      setHistory((prev) => {
        const existingEntry = prev.find((entry) => entry.date === today)

        if (existingEntry) {
          return prev.map((entry) =>
            entry.date === today ? { ...entry, tasksCompleted: entry.tasksCompleted + 1 } : entry,
          )
        } else {
          return [
            ...prev,
            {
              date: today,
              tasksCompleted: 1,
              totalPomodoros: 0,
              totalMinutes: 0,
              totalBreakMinutes: 0,
              totalMeditationMinutes: 0,
            },
          ]
        }
      })
    } else if (!completed) {
      // Task is being uncompleted - always decrement the counter
      setHistory((prev) => {
        const existingEntry = prev.find((entry) => entry.date === today)

        if (existingEntry && existingEntry.tasksCompleted > 0) {
          return prev.map((entry) =>
            entry.date === today ? { ...entry, tasksCompleted: entry.tasksCompleted - 1 } : entry,
          )
        }
        return prev
      })
    }

    // If completing active task, set next task as active
    if (completed && activeTaskId === id) {
      const nextTask = tasks.find((task) => !task.completed && task.id !== id)
      setActiveTaskId(nextTask ? nextTask.id : null)
    }

    // Also clear lastActiveTaskId if it matches and task is completed
    if (completed && lastActiveTaskId === id) {
      setLastActiveTaskId(null)
    }
  }

  const incrementPomodoroCount = (id: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              pomodorosCompleted: task.pomodorosCompleted + 1,
              totalMinutes: task.totalMinutes + minutes,
            }
          : task,
      ),
    )
  }

  const incrementBreakTime = (id: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              totalBreakMinutes: (task.totalBreakMinutes || 0) + minutes,
            }
          : task,
      ),
    )
  }

  const clearAllTasks = () => {
    setTasks([])
    setActiveTaskId(null)
    setLastActiveTaskId(null)
  }

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((task) => !task.completed))

    // Clear lastActiveTaskId if it points to a completed task
    if (lastActiveTaskId) {
      const task = tasks.find((t) => t.id === lastActiveTaskId)
      if (task && task.completed) {
        setLastActiveTaskId(null)
      }
    }
  }

  // Settings functions
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)

    // Reset timer with new settings
    resetTimer()
  }

  // Add meditation tracking function
  const addMeditationSession = (minutes: number) => {
    const today = new Date().toISOString().split("T")[0]

    setHistory((prev) => {
      const existingEntry = prev.find((entry) => entry.date === today)

      if (existingEntry) {
        return prev.map((entry) =>
          entry.date === today
            ? {
                ...entry,
                totalMeditationMinutes: (entry.totalMeditationMinutes || 0) + minutes,
              }
            : entry,
        )
      } else {
        return [
          ...prev,
          {
            date: today,
            tasksCompleted: 0,
            totalPomodoros: 0,
            totalMinutes: 0,
            totalBreakMinutes: 0,
            totalMeditationMinutes: minutes,
          },
        ]
      }
    })
  }

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadedSettings = localStorage.getItem("pomodoroSettings")
    const loadedTasks = localStorage.getItem("pomodoroTasks")
    const loadedHistory = localStorage.getItem("pomodoroHistory")

    if (loadedSettings) {
      try {
        const parsedSettings = JSON.parse(loadedSettings)
        // Ensure all new settings fields are present
        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        })
      } catch (e) {
        console.error("Error parsing settings:", e)
        setSettings(defaultSettings)
      }
    }

    if (loadedTasks) {
      try {
        const parsedTasks = JSON.parse(loadedTasks)
        setTasks(
          parsedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            totalMinutes: task.totalMinutes || 0, // Handle older data without totalMinutes
            totalBreakMinutes: task.totalBreakMinutes || 0, // Handle older data without totalBreakMinutes
            hasBeenCompletedBefore: task.hasBeenCompletedBefore || task.completed || false, // Handle older data
            startTime: task.startTime ? new Date(task.startTime) : undefined,
            endTime: task.endTime ? new Date(task.endTime) : undefined,
          })),
        )
      } catch (e) {
        console.error("Error parsing tasks:", e)
      }
    }

    // When loading history from localStorage, handle the new property
    if (loadedHistory) {
      try {
        const parsedHistory = JSON.parse(loadedHistory)
        setHistory(
          parsedHistory.map((entry: any) => ({
            ...entry,
            totalMinutes: entry.totalMinutes || entry.totalPomodoros * 25,
            totalBreakMinutes: entry.totalBreakMinutes || 0,
            totalMeditationMinutes: entry.totalMeditationMinutes || 0, // Handle older data
          })),
        )
      } catch (e) {
        console.error("Error parsing history:", e)
      }
    }
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem("pomodoroTasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("pomodoroHistory", JSON.stringify(history))
  }, [history])

  // Clean up interval and audio context on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }

      // Close audio context if it exists
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch((err) => {
          console.error("Error closing AudioContext:", err)
        })
      }
    }
  }, [intervalId])

  const updateTaskEnergyLevel = (id: string, level: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              energyLevel: level,
            }
          : task,
      ),
    )
  }

  // Update the context value to include the new function
  const value = {
    timerMode,
    timerStatus,
    timeRemaining,
    setTimerMode,
    startTimer,
    pauseTimer,
    resetTimer,
    playAlarm,

    tasks,
    activeTaskId,
    addTask,
    updateTask, // Add the new function
    removeTask,
    setActiveTask,
    completeTask,
    incrementPomodoroCount,
    incrementBreakTime,
    clearAllTasks,
    clearCompletedTasks,
    updateTaskEnergyLevel,

    settings,
    updateSettings,

    history,
    addMeditationSession,
  }

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>
}

export function usePomodoro() {
  const context = useContext(PomodoroContext)
  if (context === undefined) {
    throw new Error("usePomodoro must be used within a PomodoroProvider")
  }
  return context
}
