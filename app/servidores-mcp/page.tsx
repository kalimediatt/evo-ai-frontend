"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, MoreHorizontal, Edit, Trash2, Search, PenToolIcon as Tool } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ToolConfig = {
  id: string
  name: string
  description: string
  tags: string[]
  examples: string[]
  inputModes: string[]
  outputModes: string[]
}

type MCPServer = {
  id: string
  name: string
  description: string
  config_type: "sse" | "studio" // Tipo de configuração: SSE ou Studio
  config_json: {
    url?: string
    headers?: Record<string, string>
    command?: string
    args?: string[]
    env?: Record<string, string>
  }
  environments: Record<string, string>
  tools: ToolConfig[]
  type: string
  created_at: string
  updated_at: string | null
}

export default function MCPServersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  // Server form state
  const [serverData, setServerData] = useState<{
    name: string
    description: string
    type: string
    config_type: "sse" | "studio"
    url: string
    headers: { key: string; value: string }[]
    command: string
    args: string
    environments: { key: string }[]
    tools: ToolConfig[]
  }>({
    name: "",
    description: "",
    type: "official",
    config_type: "sse",
    url: "",
    headers: [{ key: "x-api-key", value: "" }],
    command: "npx",
    args: "",
    environments: [],
    tools: [],
  })

  // Mock MCP servers data
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    {
      id: "mcp-1",
      name: "Evo Knowledge MCP",
      description: "API for knowledge management and retrieval.",
      type: "official",
      config_type: "sse",
      config_json: {
        url: "http://localhost:5540/sse",
        headers: {
          "x-api-key": "79405047-7a5e-4b18-b25a-4af149d747dc",
        },
      },
      environments: {},
      tools: [
        {
          id: "tool-1",
          name: "knowledge_search",
          description: "Search knowledge base for information",
          tags: ["knowledge", "search"],
          examples: ["Search for information about X"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
      ],
      created_at: "2023-01-10T14:30:00Z",
      updated_at: null,
    },
    {
      id: "mcp-2",
      name: "Web Search MCP",
      description: "API for web search and information retrieval.",
      type: "official",
      config_type: "sse",
      config_json: {
        url: "http://localhost:5541/sse",
        headers: {
          "x-api-key": "8a7c6b5d-4e3f-2a1b-9c8d-7e6f5d4c3b2a",
        },
      },
      environments: {
        BRAVE_API_KEY: "env@@BRAVE_API_KEY",
      },
      tools: [
        {
          id: "tool-2",
          name: "google_search",
          description: "Search the web using Google",
          tags: ["search", "web"],
          examples: ["Search for the latest news about AI"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
        {
          id: "tool-3",
          name: "brave_search",
          description: "Search the web using Brave Search",
          tags: ["search", "web"],
          examples: ["Find information about climate change"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
      ],
      created_at: "2023-02-15T10:45:00Z",
      updated_at: "2023-03-20T09:30:00Z",
    },
    {
      id: "mcp-3",
      name: "Code Assistant MCP",
      description: "API for code generation and analysis.",
      type: "official",
      config_type: "sse",
      config_json: {
        url: "http://localhost:5542/sse",
        headers: {
          "x-api-key": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        },
      },
      environments: {
        GITHUB_TOKEN: "env@@GITHUB_TOKEN",
      },
      tools: [
        {
          id: "tool-4",
          name: "code_analysis",
          description: "Analyze code for bugs and improvements",
          tags: ["code", "analysis"],
          examples: ["Analyze this Python function for bugs"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
        {
          id: "tool-5",
          name: "code_generation",
          description: "Generate code based on requirements",
          tags: ["code", "generation"],
          examples: ["Generate a JavaScript function to sort an array"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
      ],
      created_at: "2023-03-22T09:15:00Z",
      updated_at: null,
    },
    {
      id: "mcp-4",
      name: "Brave Search Studio",
      description: "Studio-based MCP for Brave Search integration.",
      type: "official",
      config_type: "studio",
      config_json: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-brave-search"],
        env: {
          BRAVE_API_KEY: "env@@BRAVE_API_KEY",
        },
      },
      environments: {
        BRAVE_API_KEY: "env@@BRAVE_API_KEY",
      },
      tools: [
        {
          id: "tool-6",
          name: "brave_search",
          description: "Search the web using Brave Search",
          tags: ["search", "web"],
          examples: ["Search for information about climate change"],
          inputModes: ["text"],
          outputModes: ["text"],
        },
      ],
      created_at: "2023-04-05T16:20:00Z",
      updated_at: null,
    },
  ])

  const filteredServers = mcpServers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddHeader = () => {
    setServerData({
      ...serverData,
      headers: [...serverData.headers, { key: "", value: "" }],
    })
  }

  const handleRemoveHeader = (index: number) => {
    const updatedHeaders = [...serverData.headers]
    updatedHeaders.splice(index, 1)
    setServerData({
      ...serverData,
      headers: updatedHeaders,
    })
  }

  const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
    const updatedHeaders = [...serverData.headers]
    updatedHeaders[index][field] = value
    setServerData({
      ...serverData,
      headers: updatedHeaders,
    })
  }

  const handleAddEnvironment = () => {
    setServerData({
      ...serverData,
      environments: [...serverData.environments, { key: "" }],
    })
  }

  const handleRemoveEnvironment = (index: number) => {
    const updatedEnvironments = [...serverData.environments]
    updatedEnvironments.splice(index, 1)
    setServerData({
      ...serverData,
      environments: updatedEnvironments,
    })
  }

  const handleEnvironmentChange = (index: number, value: string) => {
    const updatedEnvironments = [...serverData.environments]
    updatedEnvironments[index].key = value
    setServerData({
      ...serverData,
      environments: updatedEnvironments,
    })
  }

  const handleAddTool = () => {
    const newTool: ToolConfig = {
      id: `tool-${Date.now()}`,
      name: "",
      description: "",
      tags: [],
      examples: [],
      inputModes: ["text"],
      outputModes: ["text"],
    }
    setServerData({
      ...serverData,
      tools: [...serverData.tools, newTool],
    })
  }

  const handleRemoveTool = (index: number) => {
    const updatedTools = [...serverData.tools]
    updatedTools.splice(index, 1)
    setServerData({
      ...serverData,
      tools: updatedTools,
    })
  }

  const handleToolChange = (index: number, field: keyof ToolConfig, value: any) => {
    const updatedTools = [...serverData.tools]
    updatedTools[index] = {
      ...updatedTools[index],
      [field]: value,
    }
    setServerData({
      ...serverData,
      tools: updatedTools,
    })
  }

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Convert environments array to object
      const environmentsObj: Record<string, string> = {}
      serverData.environments.forEach((env) => {
        if (env.key) {
          // Para servidores studio, sempre formatamos como env@@NOME_DA_ENV
          if (serverData.config_type === "studio") {
            environmentsObj[env.key] = `env@@${env.key}`
          } else {
            environmentsObj[env.key] = `env@@${env.key}`
          }
        }
      })

      // Convert headers array to object
      const headersObj: Record<string, string> = {}
      serverData.headers.forEach((header) => {
        if (header.key) {
          headersObj[header.key] = header.value
        }
      })

      // Preparar config_json baseado no tipo de configuração
      let config_json: any = {}

      if (serverData.config_type === "sse") {
        config_json = {
          url: serverData.url,
          headers: headersObj,
        }
      } else if (serverData.config_type === "studio") {
        // Converter a string de args em um array
        const args = serverData.args.split("\n").filter((arg) => arg.trim() !== "")

        // Preparar env para o formato env@@NOME_DA_ENV
        const envObj: Record<string, string> = {}
        serverData.environments.forEach((env) => {
          if (env.key) {
            envObj[env.key] = `env@@${env.key}`
          }
        })

        config_json = {
          command: serverData.command,
          args: args,
          env: envObj,
        }
      }

      const newServer: MCPServer = {
        id: selectedServer ? selectedServer.id : `mcp-${mcpServers.length + 1}`,
        name: serverData.name,
        description: serverData.description,
        type: serverData.type,
        config_type: serverData.config_type,
        config_json: config_json,
        environments: environmentsObj,
        tools: serverData.tools,
        created_at: selectedServer ? selectedServer.created_at : new Date().toISOString(),
        updated_at: selectedServer ? new Date().toISOString() : null,
      }

      if (selectedServer) {
        // Update existing server
        setMcpServers(mcpServers.map((server) => (server.id === selectedServer.id ? newServer : server)))
        toast({
          title: "Servidor atualizado",
          description: `${serverData.name} foi atualizado com sucesso.`,
        })
      } else {
        // Add new server
        setMcpServers([...mcpServers, newServer])
        toast({
          title: "Servidor adicionado",
          description: `${serverData.name} foi adicionado com sucesso.`,
        })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o servidor MCP. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditServer = (server: MCPServer) => {
    setSelectedServer(server)

    // Convert environments object to array
    const environmentsArray = Object.keys(server.environments).map((key) => ({
      key,
    }))

    // Convert headers object to array
    const headersArray = server.config_json.headers
      ? Object.entries(server.config_json.headers).map(([key, value]) => ({
          key,
          value: value as string,
        }))
      : [{ key: "x-api-key", value: "" }]

    // Preparar os dados do formulário com base no tipo de configuração
    if (server.config_type === "sse") {
      setServerData({
        name: server.name,
        description: server.description,
        type: server.type,
        config_type: server.config_type,
        url: server.config_json.url || "",
        headers: headersArray,
        command: "",
        args: "",
        environments: environmentsArray,
        tools: server.tools,
      })
    } else if (server.config_type === "studio") {
      setServerData({
        name: server.name,
        description: server.description,
        type: server.type,
        config_type: server.config_type,
        url: "",
        headers: [],
        command: server.config_json.command || "npx",
        args: server.config_json.args?.join("\n") || "",
        environments: environmentsArray,
        tools: server.tools,
      })
    }

    setActiveTab("basic")
    setIsDialogOpen(true)
  }

  const handleDeleteServer = (server: MCPServer) => {
    setSelectedServer(server)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteServer = async () => {
    if (!selectedServer) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMcpServers(mcpServers.filter((server) => server.id !== selectedServer.id))
      toast({
        title: "Servidor excluído",
        description: `${selectedServer.name} foi excluído com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o servidor. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setSelectedServer(null)
    }
  }

  const resetForm = () => {
    setServerData({
      name: "",
      description: "",
      type: "official",
      config_type: "sse",
      url: "",
      headers: [{ key: "x-api-key", value: "" }],
      command: "npx",
      args: "",
      environments: [],
      tools: [],
    })
    setSelectedServer(null)
    setActiveTab("basic")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Servidores MCP</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
              <Plus className="mr-2 h-4 w-4" />
              Novo Servidor MCP
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
            <form onSubmit={handleAddServer}>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedServer ? "Editar Servidor MCP" : "Novo Servidor MCP"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedServer
                    ? "Edite as informações do servidor MCP existente."
                    : "Preencha as informações para criar um novo servidor MCP."}
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="grid grid-cols-3 bg-[#222]">
                  <TabsTrigger
                    value="basic"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                  >
                    Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger
                    value="environments"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                  >
                    Variáveis de Ambiente
                  </TabsTrigger>
                  <TabsTrigger
                    value="tools"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                  >
                    Ferramentas
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto max-h-[60vh] p-4">
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={serverData.name}
                        onChange={(e) => setServerData({ ...serverData, name: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                        placeholder="Nome do servidor MCP"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        value={serverData.description}
                        onChange={(e) => setServerData({ ...serverData, description: e.target.value })}
                        className="bg-[#222] border-[#444] text-white"
                        placeholder="Descrição do servidor MCP"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-gray-300">
                        Tipo
                      </Label>
                      <Select
                        value={serverData.type}
                        onValueChange={(value) => setServerData({ ...serverData, type: value })}
                      >
                        <SelectTrigger id="type" className="w-full bg-[#222] border-[#444] text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#222] border-[#444] text-white">
                          <SelectItem value="official">Oficial</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="config_type" className="text-gray-300">
                        Tipo de Configuração
                      </Label>
                      <Select
                        value={serverData.config_type}
                        onValueChange={(value: "sse" | "studio") =>
                          setServerData({ ...serverData, config_type: value })
                        }
                      >
                        <SelectTrigger id="config_type" className="w-full bg-[#222] border-[#444] text-white">
                          <SelectValue placeholder="Selecione o tipo de configuração" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#222] border-[#444] text-white">
                          <SelectItem value="sse">SSE (Server-Sent Events)</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campos específicos para SSE */}
                    {serverData.config_type === "sse" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="url" className="text-gray-300">
                            URL
                          </Label>
                          <Input
                            id="url"
                            value={serverData.url}
                            onChange={(e) => setServerData({ ...serverData, url: e.target.value })}
                            className="bg-[#222] border-[#444] text-white"
                            placeholder="http://localhost:5540/sse"
                            required={serverData.config_type === "sse"}
                          />
                        </div>

                        {/* Headers dinâmicos */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-gray-300">Headers</Label>
                            <Button
                              type="button"
                              onClick={handleAddHeader}
                              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                              size="sm"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar Header
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {serverData.headers.map((header, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                  <Label htmlFor={`header-key-${index}`} className="sr-only">
                                    Nome do Header
                                  </Label>
                                  <Input
                                    id={`header-key-${index}`}
                                    value={header.key}
                                    onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                                    className="bg-[#222] border-[#444] text-white"
                                    placeholder="Nome do header"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label htmlFor={`header-value-${index}`} className="sr-only">
                                    Valor do Header
                                  </Label>
                                  <Input
                                    id={`header-value-${index}`}
                                    value={header.value}
                                    onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                                    className="bg-[#222] border-[#444] text-white"
                                    placeholder="Valor do header"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveHeader(index)}
                                  className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Campos específicos para Studio */}
                    {serverData.config_type === "studio" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="command" className="text-gray-300">
                            Comando
                          </Label>
                          <Input
                            id="command"
                            value={serverData.command}
                            onChange={(e) => setServerData({ ...serverData, command: e.target.value })}
                            className="bg-[#222] border-[#444] text-white"
                            placeholder="npx"
                            required={serverData.config_type === "studio"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="args" className="text-gray-300">
                            Argumentos (um por linha)
                          </Label>
                          <Textarea
                            id="args"
                            value={serverData.args}
                            onChange={(e) => setServerData({ ...serverData, args: e.target.value })}
                            className="bg-[#222] border-[#444] text-white"
                            placeholder="-y
@modelcontextprotocol/server-brave-search"
                            required={serverData.config_type === "studio"}
                          />
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="environments" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Variáveis de Ambiente</h3>
                      <Button
                        type="button"
                        onClick={handleAddEnvironment}
                        className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Variável
                      </Button>
                    </div>

                    {serverData.environments.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        Nenhuma variável de ambiente configurada. Clique em "Adicionar Variável" para começar.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {serverData.environments.map((env, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <Label htmlFor={`env-key-${index}`} className="sr-only">
                                Nome da Variável
                              </Label>
                              <Input
                                id={`env-key-${index}`}
                                value={env.key}
                                onChange={(e) => handleEnvironmentChange(index, e.target.value)}
                                className="bg-[#222] border-[#444] text-white"
                                placeholder="NOME_DA_VARIAVEL"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveEnvironment(index)}
                              className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Ferramentas</h3>
                      <Button
                        type="button"
                        onClick={handleAddTool}
                        className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Ferramenta
                      </Button>
                    </div>

                    {serverData.tools.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        Nenhuma ferramenta configurada. Clique em "Adicionar Ferramenta" para começar.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {serverData.tools.map((tool, index) => (
                          <Card key={index} className="bg-[#222] border-[#444]">
                            <CardHeader className="pb-2 flex flex-row justify-between items-start">
                              <div>
                                <CardTitle className="text-white text-base">Ferramenta {index + 1}</CardTitle>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTool(index)}
                                className="text-red-500 hover:text-red-400 hover:bg-[#333] h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-2">
                                <Label htmlFor={`tool-name-${index}`} className="text-gray-300">
                                  Nome
                                </Label>
                                <Input
                                  id={`tool-name-${index}`}
                                  value={tool.name}
                                  onChange={(e) => handleToolChange(index, "name", e.target.value)}
                                  className="bg-[#222] border-[#444] text-white"
                                  placeholder="nome_da_ferramenta"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`tool-description-${index}`} className="text-gray-300">
                                  Descrição
                                </Label>
                                <Textarea
                                  id={`tool-description-${index}`}
                                  value={tool.description}
                                  onChange={(e) => handleToolChange(index, "description", e.target.value)}
                                  className="bg-[#222] border-[#444] text-white"
                                  placeholder="Descrição da ferramenta"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`tool-tags-${index}`} className="text-gray-300">
                                  Tags (separadas por vírgula)
                                </Label>
                                <Input
                                  id={`tool-tags-${index}`}
                                  value={tool.tags.join(", ")}
                                  onChange={(e) => handleToolChange(index, "tags", e.target.value.split(", "))}
                                  className="bg-[#222] border-[#444] text-white"
                                  placeholder="tag1, tag2, tag3"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`tool-examples-${index}`} className="text-gray-300">
                                  Exemplos (separados por vírgula)
                                </Label>
                                <Textarea
                                  id={`tool-examples-${index}`}
                                  value={tool.examples.join(", ")}
                                  onChange={(e) => handleToolChange(index, "examples", e.target.value.split(", "))}
                                  className="bg-[#222] border-[#444] text-white"
                                  placeholder="Exemplo 1, Exemplo 2"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]" disabled={isLoading}>
                  {isLoading ? "Salvando..." : selectedServer ? "Salvar Alterações" : "Adicionar Servidor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o servidor "{selectedServer?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteServer}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="bg-[#1a1a1a] border-[#333] mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Buscar Servidores MCP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#222] border-[#444] text-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-[#333]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#333] hover:bg-[#222]">
                <TableHead className="text-gray-300">Nome</TableHead>
                <TableHead className="text-gray-300">Descrição</TableHead>
                <TableHead className="text-gray-300">Tipo</TableHead>
                <TableHead className="text-gray-300">Configuração</TableHead>
                <TableHead className="text-gray-300">Ferramentas</TableHead>
                <TableHead className="text-gray-300 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServers.length > 0 ? (
                filteredServers.map((server) => (
                  <TableRow key={server.id} className="border-[#333] hover:bg-[#222]">
                    <TableCell className="font-medium text-white">{server.name}</TableCell>
                    <TableCell className="text-gray-300">{server.description}</TableCell>
                    <TableCell className="text-gray-300">
                      <Badge
                        variant="outline"
                        className={
                          server.type === "official"
                            ? "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30"
                            : "bg-[#ff9d00]/10 text-[#ff9d00] border-[#ff9d00]/30"
                        }
                      >
                        {server.type === "official" ? "Oficial" : "Personalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="outline"
                          className={
                            server.config_type === "sse"
                              ? "bg-[#00b8ff]/10 text-[#00b8ff] border-[#00b8ff]/30"
                              : "bg-[#ff5e00]/10 text-[#ff5e00] border-[#ff5e00]/30"
                          }
                        >
                          {server.config_type === "sse" ? "SSE" : "Studio"}
                        </Badge>
                        {server.config_type === "sse" && (
                          <span className="text-xs truncate max-w-[200px]">{server.config_json.url}</span>
                        )}
                        {server.config_type === "studio" && (
                          <span className="text-xs truncate max-w-[200px]">
                            {server.config_json.command} {server.config_json.args?.join(" ")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center">
                        <Tool className="h-4 w-4 mr-1 text-[#00ff9d]" />
                        {server.tools.length}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:bg-[#333]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#222] border-[#444] text-white">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#444]" />
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333]"
                            onClick={() => handleEditServer(server)}
                          >
                            <Edit className="mr-2 h-4 w-4 text-[#00ff9d]" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333] text-red-500"
                            onClick={() => handleDeleteServer(server)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    Nenhum servidor MCP encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
