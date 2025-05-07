"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Key, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [userData, setUserData] = useState(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      if (user) return JSON.parse(user)
    }
    return {
      id: "",
      name: "",
      email: "",
      is_admin: false,
      email_verified: false,
      created_at: "",
    }
  })

  const [profileData, setProfileData] = useState({
    name: userData.name,
    email: userData.email,
  })
  useEffect(() => {
    setProfileData({ name: userData.name, email: userData.email })
  }, [userData])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUserData({
        ...userData,
        name: profileData.name,
        email: profileData.email,
      })

      toast({
        title: "Profile updated",
        description: "Your information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Unable to update your information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

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
        description: "Unable to update your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const handleLogout = () => {
    // Remove token from cookie
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    // Remove from localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    // Redirect to login
    router.push("/login")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`} />
                  <AvatarFallback className="text-2xl bg-[#00ff9d] text-black">
                    {(userData.name || "?")
                      .split(" ")
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-white text-xl">{userData.name}</CardTitle>
                <CardDescription className="text-gray-400">{userData.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>ID:</span>
                  <span className="text-gray-400 truncate max-w-[180px]">{userData.id}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Account Type:</span>
                  <span className="text-gray-400">{userData.is_admin ? "Administrator" : "Client"}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Email Verified:</span>
                  <span className="text-gray-400">{userData.email_verified ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Created at:</span>
                  <span className="text-gray-400">{new Date(userData.created_at).toLocaleDateString("en-US")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <Tabs defaultValue="profile">
              <TabsList className="bg-[#222] w-full">
                <TabsTrigger
                  value="profile"
                  className="flex-1 data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex-1 data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                >
                  <Key className="mr-2 h-4 w-4" /> Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleProfileUpdate}>
                  <CardHeader>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">Update your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="security">
                <form onSubmit={handlePasswordUpdate}>
                  <CardHeader>
                    <CardTitle className="text-white">Change Password</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your password to keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-gray-300">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-gray-300">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-300">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
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
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
