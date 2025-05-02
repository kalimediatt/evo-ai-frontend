"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send } from "lucide-react"

// Tipo para os agentes
type Agent = {
  id: string
  name: string
  description: string
  color: string
  systemPrompt: string
  type: string
}

export default function Chat() {
  // Estado para armazenar os agentes
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "assistant",
      name: "Assistente Geral",
      description: "Um assistente virtual útil e amigável para perguntas gerais",
      color: "bg-[#00ff9d]",
      systemPrompt: "Você é um assistente virtual útil e amigável. Responda às perguntas de forma clara e concisa.",
      type: "general",
    },
    {
      id: "coder",
      name: "Programador",
      description: "Especialista em programação e desenvolvimento de software",
      color: "bg-[#00cc7d]",
      systemPrompt:
        "Você é um programador experiente. Forneça código claro, bem comentado e explicações detalhadas sobre conceitos de programação.",
      type: "technical",
    },
    {
      id: "writer",
      name: "Redator",
      description: "Especialista em redação e revisão de textos",
      color: "bg-[#00b8ff]",
      systemPrompt:
        "Você é um redator profissional. Ajude a criar, revisar e aprimorar textos com foco em clareza, estilo e impacto.",
      type: "creative",
    },
    {
      id: "researcher",
      name: "Pesquisador",
      description: "Especialista em pesquisa e análise de informações",
      color: "bg-[#ff9d00]",
      systemPrompt:
        "Você é um pesquisador meticuloso. Forneça informações detalhadas, precisas e bem fundamentadas, citando fontes quando possível.",
      type: "academic",
    },
  ])

  const [selectedAgent, setSelectedAgent] = useState("assistant")
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      agent: selectedAgent,
    },
  })

  // Encontrar o agente selecionado
  const currentAgent = agents.find((a) => a.id === selectedAgent) || agents[0]

  return (
    <div className="flex flex-col h-screen max-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Chat com Agentes</h1>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[250px] bg-[#222] border-[#444] text-white">
            <SelectValue placeholder="Selecione um agente" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#444] text-white">
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${agent.color}`}></div>
                  {agent.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-[#1a1a1a] border-[#333]">
        <CardHeader className={`py-3 ${currentAgent.color} text-black`}>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat com {currentAgent.name}
          </CardTitle>
          <p className="text-sm text-black/80">{currentAgent.description}</p>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto pb-4 pt-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-gray-400">
                <p>Comece uma conversa com {currentAgent.name}.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === "user"

                return (
                  <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
                      <Avatar className={isUser ? "bg-[#333]" : currentAgent.color}>
                        <AvatarFallback>{isUser ? "U" : currentAgent.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg p-3 ${isUser ? "bg-[#00ff9d] text-black" : "bg-[#222]"}`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <Avatar className={currentAgent.color}>
                    <AvatarFallback>{currentAgent.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-[#222]">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce"></div>
                      <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Digite sua mensagem para ${currentAgent.name}...`}
              className="flex-1 bg-[#222] border-[#444] text-white focus-visible:ring-[#00ff9d]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
