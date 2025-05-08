"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = () => {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    }

    performLogout()
  }, [router])

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="bg-[#1a1a1a] border-[#333] w-full max-w-md p-8">
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center animate-pulse">
            <LogOut className="h-8 w-8 text-[#00ff9d]" />
          </div>
          <h2 className="text-white text-xl font-medium mt-4">Logging out...</h2>
          <p className="text-gray-400 text-center">
            You are being logged out of the system.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 