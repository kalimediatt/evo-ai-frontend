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
import { login, register as registerService, forgotPassword, getMe } from "@/services/authService"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login({
        email: loginData.email,
        password: loginData.password,
      })
      // Salvar token no localStorage
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token)
        // Salvar token em cookie (expira em 7 dias)
        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
        // Buscar dados do usuário
        const meResponse = await getMe()
        if (meResponse.data) {
          localStorage.setItem("user", JSON.stringify(meResponse.data))
          // Salvar user em cookie (expira em 7 dias)
          document.cookie = `user=${encodeURIComponent(JSON.stringify(meResponse.data))}; path=/; max-age=${60 * 60 * 24 * 7}`
        }
      }
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error?.response?.data?.detail || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erro no cadastro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await registerService({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      })
      toast({
        title: "Cadastro realizado",
        description: "Sua conta foi criada com sucesso!",
      })
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error?.response?.data?.detail || "Não foi possível criar sua conta. Tente novamente.",
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
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
      setActiveTab("login")
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error?.response?.data?.detail || "Não foi possível enviar o email de redefinição. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] p-4">
      <div className="mb-8">
        <Image src="/images/evolution-api-logo.png" alt="Evolution API" width={220} height={50} />
      </div>

      <Card className="w-full max-w-md bg-[#1a1a1a] border-[#333]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-[#222]">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Cadastro
            </TabsTrigger>
            <TabsTrigger value="forgot" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Recuperar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-white">Login</CardTitle>
                <CardDescription className="text-gray-400">
                  Entre com suas credenciais para acessar o sistema.
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
                    placeholder="seu@email.com"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">
                      Senha
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
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle className="text-white">Criar Conta</CardTitle>
                <CardDescription className="text-gray-400">
                  Preencha os dados abaixo para criar sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
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
                    placeholder="seu@email.com"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">
                    Senha
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
                  <Label htmlFor="confirm-password" className="text-gray-300">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirm-password"
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
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="forgot">
            <form onSubmit={handleForgotPassword}>
              <CardHeader>
                <CardTitle className="text-white">Recuperar Senha</CardTitle>
                <CardDescription className="text-gray-400">
                  Informe seu email para receber instruções de recuperação de senha.
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
                    placeholder="seu@email.com"
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
                  {isLoading ? "Enviando..." : "Enviar Email"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Ao usar este serviço, você concorda com nossos{" "}
          <Link href="#" className="text-[#00ff9d] hover:underline">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="#" className="text-[#00ff9d] hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
