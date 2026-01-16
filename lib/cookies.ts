"use client"

// Cookie utility functions for data persistence

export const setCookie = (name: string, value: string, days: number = 1): void => {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  
  return null
}

export const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Lax`
}

export const clearAllAppCookies = (): void => {
  const cookies = [
    "flow-state-tasks",
    "flow-state-settings", 
    "flow-state-history",
    "flow-state-active-task"
  ]
  
  cookies.forEach(cookie => deleteCookie(cookie))
}