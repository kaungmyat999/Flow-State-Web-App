"use client"

import { useState, useEffect, useRef } from "react"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Meditation() {
  const { settings, playAlarm, addMeditationSession } = usePomodoro()

  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(settings.meditationDuration * 60)
  const [minutes, setMinutes] = useState(settings.meditationDuration)
  const [seconds, setSeconds] = useState(0)

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<"in" | "holdIn" | "out" | "holdOut">("in")
  const [breathProgress, setBreathProgress] = useState(0)
  const [breathCycleTime, setBreathCycleTime] = useState(0)
  const [prevBreathPhase, setPrevBreathPhase] = useState<"in" | "holdIn" | "out" | "holdOut">("in")

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Audio context ref
  const audioContextRef = useRef<AudioContext | null>(null)

  // Refs for intervals
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const breathRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate total breath cycle time
  const totalBreathCycle =
    settings.breathInDuration + settings.holdInDuration + settings.breathOutDuration + settings.holdOutDuration

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext && !audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch((err) => console.error("Error closing audio context:", err))
      }
    }
  }, [])

  // Play breath sound based on phase transition
  const playBreathSound = (phase: "in" | "holdIn" | "out" | "holdOut") => {
    if (!soundEnabled || !audioContextRef.current) return

    // Only play sounds on transitions to different phases
    if (phase === prevBreathPhase) return

    const ctx = audioContextRef.current

    // Create oscillator and gain nodes
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Set properties based on breath phase
    switch (phase) {
      case "in":
        // Higher pitch for inhale - gentle rising tone
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(330, ctx.currentTime) // E4 note
        oscillator.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5) // A4 note (rising)

        // Fade in and out
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7)

        // Start and stop
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.7)
        break

      case "holdIn":
        // Steady tone for hold in - calming sustained note
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(440, ctx.currentTime) // A4 note (steady)

        // Gentle pulsing effect
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.3)
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)

        // Start and stop
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.6)
        break

      case "out":
        // Lower pitch for exhale - gentle falling tone
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(392, ctx.currentTime) // G4 note
        oscillator.frequency.linearRampToValueAtTime(262, ctx.currentTime + 0.8) // C4 note (falling)

        // Fade in and out
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9)

        // Start and stop
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.9)
        break

      case "holdOut":
        // Low tone for hold out - grounding effect
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(262, ctx.currentTime) // C4 note (low and steady)

        // Very subtle pulsing
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3)
        gainNode.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.4)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)

        // Start and stop
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
        break
    }

    // Update previous phase
    setPrevBreathPhase(phase)
  }

  // Play continuous ambient sound based on current breath phase
  const playContinuousSound = (phase: "in" | "holdIn" | "out" | "holdOut", progress: number) => {
    if (!soundEnabled || !audioContextRef.current || !isRunning) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const now = ctx.currentTime

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Set very low volume for ambient sound
    const baseVolume = 0.03

    // Configure sound based on phase
    switch (phase) {
      case "in":
        // Rising tone for inhale
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(330 + progress * 110, now) // Rising from 330 to 440Hz
        gainNode.gain.setValueAtTime(baseVolume, now)
        break

      case "holdIn":
        // Steady higher tone for hold in
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(440, now) // A4 note
        gainNode.gain.setValueAtTime(baseVolume * 0.8, now)
        break

      case "out":
        // Falling tone for exhale
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(392 - progress * 130, now) // Falling from 392 to 262Hz
        gainNode.gain.setValueAtTime(baseVolume, now)
        break

      case "holdOut":
        // Steady lower tone for hold out
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(262, now) // C4 note
        gainNode.gain.setValueAtTime(baseVolume * 0.7, now)
        break
    }

    // Very short duration for continuous sound (will be called frequently)
    oscillator.start(now)
    oscillator.stop(now + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.1)
  }

  // Update timer display
  useEffect(() => {
    setMinutes(Math.floor(timeRemaining / 60))
    setSeconds(timeRemaining % 60)
  }, [timeRemaining])

  // Reset timer when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(settings.meditationDuration * 60)
      setMinutes(settings.meditationDuration)
      setSeconds(0)
    }
  }, [settings.meditationDuration, isRunning])

  // Handle timer countdown
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isRunning) {
      handleComplete()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, timeRemaining])

  // Handle breathing animation with smoother transitions
  useEffect(() => {
    if (isRunning) {
      // Use a shorter interval for smoother animation
      breathRef.current = setInterval(() => {
        setBreathCycleTime((prev) => {
          const newTime = (prev + 0.05) % totalBreathCycle
          let newPhase = breathPhase

          // Determine breath phase
          if (newTime < settings.breathInDuration) {
            newPhase = "in"
            setBreathPhase(newPhase)
            const progress = newTime / settings.breathInDuration
            setBreathProgress(progress)

            // Play continuous sound during breath in
            if (soundEnabled) {
              playContinuousSound(newPhase, progress)
            }
          } else if (newTime < settings.breathInDuration + settings.holdInDuration) {
            newPhase = "holdIn"
            setBreathPhase(newPhase)
            setBreathProgress(1)

            // Play continuous sound during hold in
            if (soundEnabled) {
              playContinuousSound(newPhase, 0)
            }
          } else if (newTime < settings.breathInDuration + settings.holdInDuration + settings.breathOutDuration) {
            newPhase = "out"
            setBreathPhase(newPhase)
            const progress =
              (newTime - settings.breathInDuration - settings.holdInDuration) / settings.breathOutDuration
            setBreathProgress(1 - progress)

            // Play continuous sound during breath out
            if (soundEnabled) {
              playContinuousSound(newPhase, progress)
            }
          } else {
            newPhase = "holdOut"
            setBreathPhase(newPhase)
            setBreathProgress(0)

            // Play continuous sound during hold out
            if (soundEnabled) {
              playContinuousSound(newPhase, 0)
            }
          }

          // Play sound on phase change
          playBreathSound(newPhase)

          return newTime
        })
      }, 50) // 50ms interval for smoother animation (20 updates per second)
    }

    return () => {
      if (breathRef.current) clearInterval(breathRef.current)
    }
  }, [
    isRunning,
    settings.breathInDuration,
    settings.holdInDuration,
    settings.breathOutDuration,
    settings.holdOutDuration,
    totalBreathCycle,
    breathPhase,
    soundEnabled,
  ])

  // Start meditation
  const handleStart = () => {
    // Resume audio context if suspended (needed for browsers with autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
    setIsRunning(true)
  }

  // Pause meditation
  const handlePause = () => {
    setIsRunning(false)
  }

  // Reset meditation
  const handleReset = () => {
    setIsRunning(false)
    setTimeRemaining(settings.meditationDuration * 60)
    setMinutes(settings.meditationDuration)
    setSeconds(0)
    setBreathPhase("in")
    setPrevBreathPhase("in")
    setBreathProgress(0)
    setBreathCycleTime(0)
  }

  // Complete meditation
  const handleComplete = () => {
    setIsRunning(false)
    playAlarm()
    addMeditationSession(settings.meditationDuration)
  }

  // Get instruction text based on breath phase
  const getInstructionText = () => {
    switch (breathPhase) {
      case "in":
        return "Breathe In"
      case "holdIn":
        return "Hold"
      case "out":
        return "Breathe Out"
      case "holdOut":
        return "Hold"
      default:
        return "Breathe"
    }
  }

  // Calculate circle size based on breath progress
  const minSize = 100
  const maxSize = 300
  const circleSize = minSize + (maxSize - minSize) * breathProgress

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader className="pb-6">
        <CardTitle className="text-center">Meditation Timer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {/* Sound toggle */}
        <div className="flex items-center justify-end w-full mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sound-toggle" className="text-sm">
              Breath Sounds
            </Label>
            <div className="flex items-center">
              {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
              <Switch id="sound-toggle" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </div>
        </div>

        {/* Timer display */}
        <div className="w-full text-center mt-4">
          <div
            className={`text-6xl font-bold mb-8 tabular-nums inline-block
            ${
              breathPhase === "in"
                ? "text-blue-500 dark:text-blue-400"
                : breathPhase === "holdIn"
                  ? "text-green-500 dark:text-green-400"
                  : breathPhase === "out"
                    ? "text-purple-500 dark:text-purple-400"
                    : "text-indigo-500 dark:text-indigo-400"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>

        {/* Breathing circle animation */}
        <div className="relative flex items-center justify-center mb-8">
          <div
            className={`rounded-full transition-all duration-100 flex items-center justify-center
              ${
                breathPhase === "in"
                  ? "bg-blue-100 dark:bg-blue-900/30"
                  : breathPhase === "holdIn"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : breathPhase === "out"
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "bg-indigo-100 dark:bg-indigo-900/30"
              }`}
            style={{
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              transition: "width 0.1s ease-in-out, height 0.1s ease-in-out, background-color 0.3s ease",
            }}
          >
            <span className="text-xl font-medium">{isRunning ? getInstructionText() : "Ready"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isRunning ? (
            <Button size="lg" onClick={handleStart}>
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          ) : (
            <Button size="lg" onClick={handlePause}>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mt-6">
          Breathing pattern: {settings.breathInDuration}s in → {settings.holdInDuration}s hold →{" "}
          {settings.breathOutDuration}s out → {settings.holdOutDuration}s hold
        </div>
        <div className="text-sm text-muted-foreground">You can customize these settings in the Settings tab.</div>
      </CardContent>
    </Card>
  )
}
