"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { login, forgotPassword, getMe, register } from "@/services/authService"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  const [forgotEmail, setForgotEmail] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login({
        email: loginData.email,
        password: loginData.password,
      })
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token)
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
        const meResponse = await getMe()
        if (meResponse.data) {
          localStorage.setItem("user", JSON.stringify(meResponse.data))
          document.cookie = `user=${encodeURIComponent(JSON.stringify(meResponse.data))}; path=/; max-age=${60 * 60 * 24 * 7}`
        }
      }
      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error logging in",
        description: error?.response?.data?.detail || "Check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validDomains = [
    "brius.com.br",
    "etus.digital",
    "etusdigital.com.br",
  ]
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validDomains.some(domain => registerData.email.endsWith(`@${domain}`))) {
      toast({
        title: "Invalid email",
        description: "Domain not allowed",
        variant: "destructive",
      })
      return
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)

    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
      })
      
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      })
      
      // Switch to login tab after successful registration
      setActiveTab("login")
      // Pre-fill login email with the registered email
      setLoginData({
        ...loginData,
        email: registerData.email
      })
      
    } catch (error: any) {
      toast({
        title: "Error registering",
        description: error?.response?.data?.detail || "Unable to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await forgotPassword({ email: forgotEmail })
      toast({
        title: "Email sent",
        description: "Check your inbox to reset your password.",
      })
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: "Error sending email",
        description: error?.response?.data?.detail || "Unable to send the reset password email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] p-4">
      <div className="mb-8">
        <Image 
          src="/images/evolution-api-logo.png" 
          alt="Evolution API" 
          width={140} 
          height={30}
          priority 
        />
      </div>

      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-[#222]">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Register
            </TabsTrigger>
            <TabsTrigger value="forgot" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Forgot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-white">Login</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your credentials to access the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                  {isLoading ? "Entering..." : "Enter"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle className="text-white">Register</CardTitle>
                <CardDescription className="text-gray-400">
                  Create a new account to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-gray-300">
                    Confirm Password
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
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
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="forgot">
            <form onSubmit={handleForgotPassword}>
              <CardHeader>
                <CardTitle className="text-white">Forgot Password</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your email to receive a password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
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
                  {isLoading ? "Sending..." : "Send Link"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          By using this service, you agree to our{" "}
          <Link href="#" className="text-[#00ff9d] hover:underline">
            Terms of Service
          </Link>{" "}
          e{" "}
          <Link href="#" className="text-[#00ff9d] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
