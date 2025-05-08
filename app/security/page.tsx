"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Shield } from "lucide-react"
import { changePassword } from "@/services/authService"

export default function SecurityPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error updating password",
        description: "The passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error updating password",
        description: error instanceof Error ? error.message : "Unable to update your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-[#1a1a1a] border-[#333]">
          <CardHeader className="flex flex-row items-center gap-4">
            <Shield className="w-8 h-8 text-[#00ff9d]" />
            <div>
              <CardTitle className="text-white">Account Security</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account security settings
              </CardDescription>
            </div>
          </CardHeader>
          
          <form onSubmit={handlePasswordUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="current-password" className="text-gray-300">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="bg-[#222] border-[#444] text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password" className="text-gray-300">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-[#222] border-[#444] text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password" className="text-gray-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-[#222] border-[#444] text-white"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 