"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Timer from "@/components/timer"
import TaskList from "@/components/task-list"
import Settings from "@/components/settings"
import Dashboard from "@/components/dashboard"
import Meditation from "@/components/meditation"
import TodoList from "@/components/todo-list"
import { PomodoroProvider } from "@/components/pomodoro-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [activeTab, setActiveTab] = useState("timer")
  return (
    <PomodoroProvider>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8 mt-4">
          <h1 
            className="text-3xl font-pacifico cursor-pointer hover:opacity-80 transition-opacity" 
            style={{ fontFamily: "var(--font-pacifico)" }}
            onClick={() => setActiveTab("timer")}
          >
            Flow State
          </h1>
          <ThemeToggle />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="todo">Tasks</TabsTrigger>
            <TabsTrigger value="meditation">Meditation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-8 mt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Timer />
              </div>
              <div>
                <TaskList />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="todo">
            <TodoList />
          </TabsContent>

          <TabsContent value="meditation">
            <Meditation />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PomodoroProvider>
  )
}
