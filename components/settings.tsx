"use client"

import { useState } from "react"
import { usePomodoro } from "@/components/pomodoro-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Volume2, VolumeX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  const { settings, updateSettings, playAlarm } = usePomodoro()

  // Timer settings
  const [pomodoroLength, setPomodoroLength] = useState(settings.pomodoroLength)
  const [shortBreakLength, setShortBreakLength] = useState(settings.shortBreakLength)
  const [longBreakLength, setLongBreakLength] = useState(settings.longBreakLength)
  const [alarmEnabled, setAlarmEnabled] = useState(settings.alarmEnabled)

  // Meditation settings
  const [meditationDuration, setMeditationDuration] = useState(settings.meditationDuration || 10)
  const [breathInDuration, setBreathInDuration] = useState(settings.breathInDuration || 4)
  const [holdInDuration, setHoldInDuration] = useState(settings.holdInDuration || 2)
  const [breathOutDuration, setBreathOutDuration] = useState(settings.breathOutDuration || 6)
  const [holdOutDuration, setHoldOutDuration] = useState(settings.holdOutDuration || 2)

  // Calculate total breath cycle time
  const totalBreathCycle = breathInDuration + holdInDuration + breathOutDuration + holdOutDuration

  const handleSaveSettings = () => {
    updateSettings({
      pomodoroLength,
      shortBreakLength,
      longBreakLength,
      alarmEnabled,
      meditationDuration,
      breathInDuration,
      holdInDuration,
      breathOutDuration,
      holdOutDuration,
    })

    toast({
      title: "Settings saved",
      description: "Your timer settings have been updated.",
    })
  }

  // Test alarm sound
  const handleTestAlarm = () => {
    if (!alarmEnabled) {
      toast({
        title: "Alarm is disabled",
        description: "Enable the alarm to test the sound.",
        variant: "destructive",
      })
      return
    }

    playAlarm()
    toast({
      title: "Testing alarm sound",
      description: "You should hear the alarm sound now.",
    })
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Customize your timer, notifications, and meditation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Timer Settings</TabsTrigger>
            <TabsTrigger value="meditation">Meditation Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="pomodoro-length">Pomodoro Length: {pomodoroLength} minutes</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id="pomodoro-length"
                    min={1}
                    max={60}
                    step={1}
                    value={[pomodoroLength]}
                    onValueChange={(value) => setPomodoroLength(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={pomodoroLength}
                    onChange={(e) => setPomodoroLength(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="short-break-length">Short Break Length: {shortBreakLength} minutes</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id="short-break-length"
                    min={1}
                    max={30}
                    step={1}
                    value={[shortBreakLength]}
                    onValueChange={(value) => setShortBreakLength(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={shortBreakLength}
                    onChange={(e) => setShortBreakLength(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="long-break-length">Long Break Length: {longBreakLength} minutes</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id="long-break-length"
                    min={1}
                    max={60}
                    step={1}
                    value={[longBreakLength]}
                    onValueChange={(value) => setLongBreakLength(value[0])}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={longBreakLength}
                    onChange={(e) => setLongBreakLength(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2 pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="alarm-toggle">Alarm Sound</Label>
                  <p className="text-sm text-muted-foreground">Play a sound when timer completes</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleTestAlarm} disabled={!alarmEnabled}>
                    Test Sound
                  </Button>
                  <div className="flex items-center">
                    {alarmEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    <Switch id="alarm-toggle" checked={alarmEnabled} onCheckedChange={setAlarmEnabled} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="meditation" className="space-y-6 pt-4">
            {/* Meditation Duration setting */}
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="meditation-duration">Default Session Duration: {meditationDuration} minutes</Label>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="meditation-duration"
                  min={1}
                  max={60}
                  step={1}
                  value={[meditationDuration]}
                  onValueChange={(value) => setMeditationDuration(value[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={meditationDuration}
                  onChange={(e) => setMeditationDuration(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>

            {/* Breath settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Breathing Pattern (seconds)</h3>

              {/* Breath in duration */}
              <div>
                <Label htmlFor="breath-in">Breathe In: {breathInDuration}s</Label>
                <Slider
                  id="breath-in"
                  min={1}
                  max={10}
                  step={1}
                  value={[breathInDuration]}
                  onValueChange={(value) => setBreathInDuration(value[0])}
                  className="mt-2"
                />
              </div>

              {/* Hold after inhale */}
              <div>
                <Label htmlFor="hold-in">Hold After Inhale: {holdInDuration}s</Label>
                <Slider
                  id="hold-in"
                  min={0}
                  max={10}
                  step={1}
                  value={[holdInDuration]}
                  onValueChange={(value) => setHoldInDuration(value[0])}
                  className="mt-2"
                />
              </div>

              {/* Breath out duration */}
              <div>
                <Label htmlFor="breath-out">Breathe Out: {breathOutDuration}s</Label>
                <Slider
                  id="breath-out"
                  min={1}
                  max={10}
                  step={1}
                  value={[breathOutDuration]}
                  onValueChange={(value) => setBreathOutDuration(value[0])}
                  className="mt-2"
                />
              </div>

              {/* Hold after exhale */}
              <div>
                <Label htmlFor="hold-out">Hold After Exhale: {holdOutDuration}s</Label>
                <Slider
                  id="hold-out"
                  min={0}
                  max={10}
                  step={1}
                  value={[holdOutDuration]}
                  onValueChange={(value) => setHoldOutDuration(value[0])}
                  className="mt-2"
                />
              </div>

              <div className="text-sm text-muted-foreground mt-2">Total breath cycle: {totalBreathCycle} seconds</div>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSaveSettings} className="w-full mt-6">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
