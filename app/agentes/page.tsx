"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Edit,
  Trash2,
  Code,
  Workflow,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Server,
  PenToolIcon as ToolIcon,
  X,
  Settings,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
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

// Tipos para os agentes
type AgentType = "llm" | "a2a" | "sequential" | "parallel" | "loop"

type Tool = {
  id: string
  name: string
  description: string
  envs: Record<string, string>
}

type MCPServer = {
  id: string
  name: string
  description: string
  type: string
  config_type?: "sse" | "studio" // Novo campo para diferenciar os tipos de configuração
  config_json: {
    url?: string
    headers?: Record<string, string>
    command?: string
    args?: string[]
    env?: Record<string, string>
  }
  environments: Record<string, string>
  tools: string[]
  envs?: Record<string, string>
  selected_tools?: string[]
}

type CustomTools = {
  http_tools: any[]
}

type AgentConfig = {
  tools?: Tool[]
  mcp_servers?: MCPServer[]
  custom_tools?: CustomTools
  sub_agents?: string[]
  max_iterations?: number
}

type Agent = {
  id: string
  client_id: string
  name: string
  description: string
  type: AgentType
  model?: string
  api_key?: string
  instruction?: string
  agent_card_url?: string
  config: AgentConfig
  color?: string // Para visualização na UI
}

export default function AgentsPage() {
  const { toast } = useToast()

  // Lista de MCPs disponíveis
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([
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
      tools: [],
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
      tools: ["google_search", "brave_search", "bing_search"],
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
      tools: ["code_analysis", "code_generation", "code_review"],
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
      tools: ["brave_search"],
    },
  ])

  // Lista de ferramentas disponíveis
  const [availableTools, setAvailableTools] = useState<Tool[]>([
    {
      id: "tool-1",
      name: "Google Search",
      description: "Search the web using Google",
      envs: {
        GOOGLE_API_KEY: "",
        GOOGLE_CSE_ID: "",
      },
    },
    {
      id: "tool-2",
      name: "Weather API",
      description: "Get weather information for a location",
      envs: {
        WEATHER_API_KEY: "",
      },
    },
    {
      id: "tool-3",
      name: "File Storage",
      description: "Store and retrieve files",
      envs: {
        STORAGE_API_KEY: "",
        STORAGE_ENDPOINT: "",
      },
    },
  ])

  // Estado inicial com alguns agentes pré-definidos
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "assistant-1",
      client_id: "client-123",
      name: "Assistente Geral",
      description: "Um assistente virtual útil e amigável para perguntas gerais",
      type: "llm",
      model: "gpt-4",
      api_key: "sk-xxxx",
      instruction: "Você é um assistente virtual útil e amigável. Responda às perguntas de forma clara e concisa.",
      config: {
        tools: [],
        mcp_servers: [],
        custom_tools: {
          http_tools: [],
        },
        sub_agents: [],
      },
      color: "bg-[#00ff9d]",
    },
    {
      id: "coder-1",
      client_id: "client-123",
      name: "Programador",
      description: "Especialista em programação e desenvolvimento de software",
      type: "llm",
      model: "gpt-4",
      api_key: "sk-xxxx",
      instruction: "Você é um programador experiente. Forneça código claro, bem comentado e explicações detalhadas.",
      config: {
        tools: [
          {
            id: "tool-123",
            name: "Code Analysis",
            description: "Analyze code for bugs and improvements",
            envs: {
              API_KEY: "tool-api-key",
              ENDPOINT: "http://localhost:8000",
            },
          },
        ],
        mcp_servers: [
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
              GITHUB_TOKEN: "github_token_value",
            },
            tools: ["code_analysis", "code_generation"],
            selected_tools: ["code_analysis", "code_generation"],
            envs: {
              GITHUB_TOKEN: "github_token_value",
            },
          },
        ],
        sub_agents: [],
      },
      color: "bg-[#00cc7d]",
    },
    {
      id: "a2a-agent-1",
      client_id: "client-123",
      name: "Agente A2A",
      description: "Agente que implementa o protocolo A2A do Google",
      type: "a2a",
      agent_card_url: "http://localhost:8001/api/v1/a2a/your-agent/.well-known/agent.json",
      config: {
        sub_agents: [],
      },
      color: "bg-[#00b8ff]",
    },
    {
      id: "sequential-1",
      client_id: "client-123",
      name: "Fluxo de Processamento",
      description: "Executa uma sequência de sub-agentes em ordem específica",
      type: "sequential",
      config: {
        sub_agents: ["assistant-1", "coder-1"],
      },
      color: "bg-[#ff9d00]",
    },
    {
      id: "parallel-1",
      client_id: "client-123",
      name: "Processamento Paralelo",
      description: "Executa múltiplos sub-agentes simultaneamente",
      type: "parallel",
      config: {
        sub_agents: ["assistant-1", "coder-1"],
      },
      color: "bg-[#ff5e00]",
    },
    {
      id: "loop-1",
      client_id: "client-123",
      name: "Processamento em Loop",
      description: "Executa sub-agentes em um loop com número máximo de iterações",
      type: "loop",
      config: {
        sub_agents: ["assistant-1"],
        max_iterations: 5,
      },
      color: "bg-[#00ffff]",
    },
  ])

  // Estado para o formulário de novo agente
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    client_id: "client-123",
    name: "",
    description: "",
    type: "llm",
    model: "gpt-4",
    instruction: "",
    config: {
      tools: [],
      mcp_servers: [],
      custom_tools: {
        http_tools: [],
      },
      sub_agents: [],
    },
    color: "bg-[#00ff9d]",
  })

  // Estado para controlar o diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Estado para edição
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  // Estado para a aba ativa no formulário
  const [activeTab, setActiveTab] = useState("basic")

  // Estado para o diálogo de MCP
  const [isMCPDialogOpen, setIsMCPDialogOpen] = useState(false)
  const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null)
  const [mcpEnvs, setMcpEnvs] = useState<Record<string, string>>({})
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([])

  // Estado para o diálogo de ferramentas
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [toolEnvs, setToolEnvs] = useState<Record<string, string>>({})

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  // Cores disponíveis
  const availableColors = [
    { value: "bg-[#00ff9d]", label: "Verde Evolution" },
    { value: "bg-[#00cc7d]", label: "Verde Escuro" },
    { value: "bg-[#00b8ff]", label: "Azul" },
    { value: "bg-[#ff9d00]", label: "Laranja" },
    { value: "bg-[#ff5e00]", label: "Laranja Escuro" },
    { value: "bg-[#00ffff]", label: "Ciano" },
    { value: "bg-[#ff00ff]", label: "Magenta" },
    { value: "bg-[#ffff00]", label: "Amarelo" },
  ]

  // Tipos de agentes
  const agentTypes = [
    { value: "llm", label: "LLM Agent", icon: Code },
    { value: "a2a", label: "A2A Agent", icon: ExternalLink },
    { value: "sequential", label: "Sequential Agent", icon: Workflow },
    { value: "parallel", label: "Parallel Agent", icon: GitBranch },
    { value: "loop", label: "Loop Agent", icon: RefreshCw },
  ]

  // Modelos disponíveis
  const availableModels = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ]

  // Efeito para atualizar o formulário com base no tipo de agente
  useEffect(() => {
    if (newAgent.type === "llm") {
      setNewAgent((prev) => ({
        ...prev,
        model: prev.model || "gpt-4",
        instruction: prev.instruction || "",
        agent_card_url: undefined,
        config: {
          ...prev.config,
          max_iterations: undefined,
        },
      }))
    } else if (newAgent.type === "a2a") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: prev.agent_card_url || "http://localhost:8001/api/v1/a2a/agent/.well-known/agent.json",
        config: {
          ...prev.config,
          max_iterations: undefined,
        },
      }))
    } else if (newAgent.type === "loop") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        config: {
          ...prev.config,
          max_iterations: prev.config?.max_iterations || 5,
        },
      }))
    } else {
      // sequential ou parallel
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        config: {
          ...prev.config,
          max_iterations: undefined,
        },
      }))
    }
  }, [newAgent.type])

  // Função para adicionar um novo agente
  const handleAddAgent = () => {
    if (!newAgent.name) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do agente é obrigatório",
        variant: "destructive",
      })
      return
    }

    // Validações específicas por tipo
    if (newAgent.type === "llm" && !newAgent.instruction) {
      toast({
        title: "Campo obrigatório",
        description: "Instruções são obrigatórias para agentes LLM",
        variant: "destructive",
      })
      return
    }

    if (newAgent.type === "a2a" && !newAgent.agent_card_url) {
      toast({
        title: "Campo obrigatório",
        description: "URL do Agent Card é obrigatória para agentes A2A",
        variant: "destructive",
      })
      return
    }

    if (newAgent.type === "loop" && (!newAgent.config?.max_iterations || newAgent.config.max_iterations <= 0)) {
      toast({
        title: "Campo obrigatório",
        description: "Número máximo de iterações é obrigatório para agentes Loop",
        variant: "destructive",
      })
      return
    }

    // Gerar ID baseado no nome
    const id = newAgent.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4)

    if (editingAgent) {
      // Atualizar agente existente
      setAgents(
        agents.map((agent) => (agent.id === editingAgent.id ? ({ ...newAgent, id: editingAgent.id } as Agent) : agent)),
      )
      toast({
        title: "Agente atualizado",
        description: `${newAgent.name} foi atualizado com sucesso`,
      })
    } else {
      // Adicionar novo agente
      setAgents([...agents, { ...newAgent, id } as Agent])
      toast({
        title: "Agente adicionado",
        description: `${newAgent.name} foi adicionado com sucesso`,
      })
    }

    // Resetar formulário e fechar diálogo
    resetForm()
    setIsDialogOpen(false)
  }

  // Função para excluir um agente
  const handleDeleteAgent = (id: string) => {
    const agent = agents.find((a) => a.id === id)
    if (agent) {
      setAgentToDelete(agent)
      setIsDeleteDialogOpen(true)
    }
  }

  // Função para confirmar exclusão
  const confirmDeleteAgent = () => {
    if (agentToDelete) {
      setAgents(agents.filter((agent) => agent.id !== agentToDelete.id))
      toast({
        title: "Agente excluído",
        description: "O agente foi excluído com sucesso",
      })
      setAgentToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Função para editar um agente
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setNewAgent({ ...agent })
    setActiveTab("basic")
    setIsDialogOpen(true)
  }

  // Função para resetar o formulário
  const resetForm = () => {
    setNewAgent({
      client_id: "client-123",
      name: "",
      description: "",
      type: "llm",
      model: "gpt-4",
      instruction: "",
      config: {
        tools: [],
        mcp_servers: [],
        custom_tools: {
          http_tools: [],
        },
        sub_agents: [],
      },
      color: "bg-[#00ff9d]",
    })
    setEditingAgent(null)
    setActiveTab("basic")
  }

  // Função para adicionar um sub-agente
  const handleAddSubAgent = (agentId: string) => {
    if (!newAgent.config?.sub_agents?.includes(agentId)) {
      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          sub_agents: [...(newAgent.config?.sub_agents || []), agentId],
        },
      })
    }
  }

  // Função para remover um sub-agente
  const handleRemoveSubAgent = (agentId: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        sub_agents: newAgent.config?.sub_agents?.filter((id) => id !== agentId) || [],
      },
    })
  }

  // Função para abrir o diálogo de MCP
  const handleOpenMCPDialog = (mcp?: MCPServer) => {
    if (mcp) {
      setSelectedMCP(mcp)
      setMcpEnvs(mcp.envs || {})
      setSelectedMCPTools(mcp.selected_tools || [])
    } else {
      // Valor padrão para um novo MCP
      setSelectedMCP(null)
      setMcpEnvs({})
      setSelectedMCPTools([])
    }
    setIsMCPDialogOpen(true)
  }

  // Função para adicionar ou atualizar um MCP
  const handleAddMCP = () => {
    if (!selectedMCP) {
      toast({
        title: "Erro",
        description: "Nenhum MCP selecionado",
        variant: "destructive",
      })
      return
    }

    const updatedMCP: MCPServer = {
      ...selectedMCP,
      envs: mcpEnvs,
      selected_tools: selectedMCPTools,
    }

    const existingMCPIndex = newAgent.config?.mcp_servers?.findIndex((mcp) => mcp.id === updatedMCP.id)

    if (existingMCPIndex !== undefined && existingMCPIndex >= 0) {
      // Atualizar MCP existente
      const updatedMCPs = [...(newAgent.config?.mcp_servers || [])]
      updatedMCPs[existingMCPIndex] = updatedMCP

      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          mcp_servers: updatedMCPs,
        },
      })
    } else {
      // Adicionar novo MCP
      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          mcp_servers: [...(newAgent.config?.mcp_servers || []), updatedMCP],
        },
      })
    }

    setIsMCPDialogOpen(false)
    toast({
      title: "MCP configurado",
      description: `${updatedMCP.name} foi configurado com sucesso`,
    })
  }

  // Função para remover um MCP
  const handleRemoveMCP = (mcpId: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        mcp_servers: newAgent.config?.mcp_servers?.filter((mcp) => mcp.id !== mcpId) || [],
      },
    })
    toast({
      title: "MCP removido",
      description: "O MCP foi removido com sucesso",
    })
  }

  // Função para abrir o diálogo de ferramenta
  const handleOpenToolDialog = (tool?: Tool) => {
    if (tool) {
      setSelectedTool(tool)
      setToolEnvs(tool.envs || {})
    } else {
      setSelectedTool(null)
      setToolEnvs({})
    }
    setIsToolDialogOpen(true)
  }

  // Função para adicionar ou atualizar uma ferramenta
  const handleAddTool = () => {
    if (!selectedTool) {
      toast({
        title: "Erro",
        description: "Nenhuma ferramenta selecionada",
        variant: "destructive",
      })
      return
    }

    const updatedTool: Tool = {
      ...selectedTool,
      envs: toolEnvs,
    }

    const existingToolIndex = newAgent.config?.tools?.findIndex((tool) => tool.id === updatedTool.id)

    if (existingToolIndex !== undefined && existingToolIndex >= 0) {
      // Atualizar ferramenta existente
      const updatedTools = [...(newAgent.config?.tools || [])]
      updatedTools[existingToolIndex] = updatedTool

      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          tools: updatedTools,
        },
      })
    } else {
      // Adicionar nova ferramenta
      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          tools: [...(newAgent.config?.tools || []), updatedTool],
        },
      })
    }

    setIsToolDialogOpen(false)
    toast({
      title: "Ferramenta configurada",
      description: `${updatedTool.name} foi configurada com sucesso`,
    })
  }

  // Função para remover uma ferramenta
  const handleRemoveTool = (toolId: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        tools: newAgent.config?.tools?.filter((tool) => tool.id !== toolId) || [],
      },
    })
    toast({
      title: "Ferramenta removida",
      description: "A ferramenta foi removida com sucesso",
    })
  }

  // Função para obter o ícone do tipo de agente
  const getAgentTypeIcon = (type: AgentType) => {
    const agentType = agentTypes.find((t) => t.value === type)
    if (agentType) {
      const IconComponent = agentType.icon
      return <IconComponent className="h-5 w-5" />
    }
    return null
  }

  // Função para obter o nome do tipo de agente
  const getAgentTypeName = (type: AgentType) => {
    return agentTypes.find((t) => t.value === type)?.label || type
  }

  // Função para obter o nome de um agente pelo ID
  const getAgentNameById = (id: string) => {
    const agent = agents.find((a) => a.id === id)
    return agent ? agent.name : id
  }

  // Função para alternar a seleção de uma ferramenta MCP
  const toggleMCPTool = (toolName: string) => {
    if (selectedMCPTools.includes(toolName)) {
      setSelectedMCPTools(selectedMCPTools.filter((t) => t !== toolName))
    } else {
      setSelectedMCPTools([...selectedMCPTools, toolName])
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Agentes</h1>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
              }}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-white">{editingAgent ? "Editar Agente" : "Novo Agente"}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingAgent
                  ? "Edite as informações do agente existente"
                  : "Preencha as informações para criar um novo agente"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-3 bg-[#222]">
                <TabsTrigger value="basic" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
                  Informações Básicas
                </TabsTrigger>
                <TabsTrigger
                  value="config"
                  className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                >
                  Configuração
                </TabsTrigger>
                <TabsTrigger
                  value="subagents"
                  className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                >
                  Sub-Agentes
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 overflow-auto">
                <TabsContent value="basic" className="p-4 space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right text-gray-300">
                      Tipo de Agente
                    </Label>
                    <Select
                      value={newAgent.type}
                      onValueChange={(value: AgentType) => setNewAgent({ ...newAgent, type: value })}
                    >
                      <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222] border-[#444] text-white">
                        {agentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4 text-[#00ff9d]" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-gray-300">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={newAgent.name || ""}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      className="col-span-3 bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right text-gray-300">
                      Descrição
                    </Label>
                    <Input
                      id="description"
                      value={newAgent.description || ""}
                      onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                      className="col-span-3 bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right text-gray-300">
                      Cor
                    </Label>
                    <Select
                      value={newAgent.color}
                      onValueChange={(value) => setNewAgent({ ...newAgent, color: value })}
                    >
                      <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Selecione a cor" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222] border-[#444] text-white">
                        {availableColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${color.value}`}></div>
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newAgent.type === "llm" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right text-gray-300">
                          Modelo
                        </Label>
                        <Select
                          value={newAgent.model}
                          onValueChange={(value) => setNewAgent({ ...newAgent, model: value })}
                        >
                          <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#222] border-[#444] text-white">
                            {availableModels.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="api_key" className="text-right text-gray-300">
                          API Key
                        </Label>
                        <Input
                          id="api_key"
                          value={newAgent.api_key || ""}
                          onChange={(e) => setNewAgent({ ...newAgent, api_key: e.target.value })}
                          className="col-span-3 bg-[#222] border-[#444] text-white"
                          type="password"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="instruction" className="text-right pt-2 text-gray-300">
                          Instruções
                        </Label>
                        <Textarea
                          id="instruction"
                          value={newAgent.instruction || ""}
                          onChange={(e) => setNewAgent({ ...newAgent, instruction: e.target.value })}
                          className="col-span-3 bg-[#222] border-[#444] text-white"
                          rows={4}
                        />
                      </div>
                    </>
                  )}

                  {newAgent.type === "a2a" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="agent_card_url" className="text-right text-gray-300">
                        URL do Agent Card
                      </Label>
                      <Input
                        id="agent_card_url"
                        value={newAgent.agent_card_url || ""}
                        onChange={(e) => setNewAgent({ ...newAgent, agent_card_url: e.target.value })}
                        className="col-span-3 bg-[#222] border-[#444] text-white"
                      />
                    </div>
                  )}

                  {newAgent.type === "loop" && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max_iterations" className="text-right text-gray-300">
                        Máximo de Iterações
                      </Label>
                      <Input
                        id="max_iterations"
                        type="number"
                        min="1"
                        value={newAgent.config?.max_iterations || ""}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            config: {
                              ...newAgent.config,
                              max_iterations: Number.parseInt(e.target.value) || 1,
                            },
                          })
                        }
                        className="col-span-3 bg-[#222] border-[#444] text-white"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="config" className="p-4 space-y-4">
                  {newAgent.type === "llm" && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Ferramentas</h3>
                        <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                          <p className="text-sm text-gray-400 mb-4">
                            Configure as ferramentas que este agente pode utilizar.
                          </p>

                          {newAgent.config?.tools && newAgent.config.tools.length > 0 ? (
                            <div className="space-y-2">
                              {newAgent.config.tools.map((tool) => (
                                <div
                                  key={tool.id}
                                  className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                >
                                  <div>
                                    <p className="font-medium text-white">{tool.name}</p>
                                    <p className="text-sm text-gray-400">{tool.description}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenToolDialog(tool)}
                                      className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                    >
                                      <Settings className="h-4 w-4 mr-1" /> Configurar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveTool(tool.id)}
                                      className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              {/* Botão para adicionar mais ferramentas, sempre visível */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenToolDialog()}
                                className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar Ferramenta
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md mb-2">
                              <div>
                                <p className="font-medium text-white">Sem ferramentas configuradas</p>
                                <p className="text-sm text-gray-400">Adicione ferramentas para este agente</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenToolDialog()}
                                className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Servidores MCP</h3>
                        <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                          <p className="text-sm text-gray-400 mb-4">
                            Configure os servidores MCP que este agente pode utilizar.
                          </p>

                          {newAgent.config?.mcp_servers && newAgent.config.mcp_servers.length > 0 ? (
                            <div className="space-y-2">
                              {newAgent.config.mcp_servers.map((mcp) => (
                                <div
                                  key={mcp.id}
                                  className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                >
                                  <div>
                                    <p className="font-medium text-white">{mcp.name}</p>
                                    <p className="text-sm text-gray-400">{mcp.description}</p>
                                    {mcp.selected_tools && mcp.selected_tools.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {mcp.selected_tools.map((tool) => (
                                          <Badge
                                            key={tool}
                                            variant="outline"
                                            className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                                          >
                                            {tool}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenMCPDialog(mcp)}
                                      className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                    >
                                      <Settings className="h-4 w-4 mr-1" /> Configurar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMCP(mcp.id)}
                                      className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              {/* Botão para adicionar mais servidores MCP, sempre visível */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenMCPDialog()}
                                className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar Servidor MCP
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md mb-2">
                              <div>
                                <p className="font-medium text-white">Sem servidores MCP configurados</p>
                                <p className="text-sm text-gray-400">Adicione servidores MCP para este agente</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenMCPDialog()}
                                className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {(newAgent.type === "sequential" || newAgent.type === "parallel" || newAgent.type === "loop") && (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center">
                        <p className="text-gray-400">Configure os sub-agentes na aba "Sub-Agentes"</p>
                      </div>
                    </div>
                  )}

                  {newAgent.type === "a2a" && (
                    <div className="flex items-center justify-center h-40">
                      <div className="text-center">
                        <p className="text-gray-400">Agentes A2A são configurados através do Agent Card URL</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Sub-agentes podem ser configurados na aba "Sub-Agentes"
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="subagents" className="p-4 space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Sub-Agentes</h3>
                      <div className="text-sm text-gray-400">
                        {newAgent.config?.sub_agents?.length || 0} sub-agentes selecionados
                      </div>
                    </div>

                    <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                      <p className="text-sm text-gray-400 mb-4">
                        Selecione os agentes que serão utilizados como sub-agentes.
                      </p>

                      {/* Lista de sub-agentes selecionados */}
                      {newAgent.config?.sub_agents && newAgent.config.sub_agents.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          <h4 className="text-sm font-medium text-white">Sub-agentes selecionados:</h4>
                          <div className="flex flex-wrap gap-2">
                            {newAgent.config.sub_agents.map((agentId) => (
                              <Badge
                                key={agentId}
                                variant="secondary"
                                className="flex items-center gap-1 bg-[#333] text-[#00ff9d]"
                              >
                                {getAgentNameById(agentId)}
                                <button
                                  onClick={() => handleRemoveSubAgent(agentId)}
                                  className="ml-1 h-4 w-4 rounded-full hover:bg-[#444] inline-flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 mb-4">Nenhum sub-agente selecionado</div>
                      )}

                      {/* Lista de agentes disponíveis */}
                      <h4 className="text-sm font-medium text-white mb-2">Agentes disponíveis:</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {agents
                          .filter((agent) => agent.id !== editingAgent?.id) // Não mostrar o próprio agente sendo editado
                          .map((agent) => (
                            <div
                              key={agent.id}
                              className="flex items-center justify-between p-2 hover:bg-[#2a2a2a] rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${agent.color}`}></div>
                                <span className="font-medium text-white">{agent.name}</span>
                                <Badge variant="outline" className="ml-2 border-[#444] text-gray-300">
                                  {getAgentTypeName(agent.type)}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddSubAgent(agent.id)}
                                disabled={newAgent.config?.sub_agents?.includes(agent.id)}
                                className={
                                  newAgent.config?.sub_agents?.includes(agent.id)
                                    ? "text-gray-500"
                                    : "text-[#00ff9d] hover:bg-[#00ff9d]/10"
                                }
                              >
                                {newAgent.config?.sub_agents?.includes(agent.id) ? "Adicionado" : "Adicionar"}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddAgent} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
                {editingAgent ? "Salvar Alterações" : "Adicionar Agente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Tem certeza que deseja excluir o agente "{agentToDelete?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAgent} className="bg-red-600 text-white hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo para configuração de MCP */}
        <Dialog open={isMCPDialogOpen} onOpenChange={setIsMCPDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-white">Configurar Servidor MCP</DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecione um servidor MCP e configure suas ferramentas.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mcp-select" className="text-gray-300">
                    Servidor MCP
                  </Label>
                  <Select
                    value={selectedMCP?.id}
                    onValueChange={(value) => {
                      const mcp = availableMCPs.find((m) => m.id === value)
                      if (mcp) {
                        setSelectedMCP(mcp)
                        // Inicializar variáveis de ambiente
                        const initialEnvs: Record<string, string> = {}
                        Object.keys(mcp.environments).forEach((key) => {
                          initialEnvs[key] = ""
                        })
                        setMcpEnvs(initialEnvs)
                        setSelectedMCPTools([])
                      }
                    }}
                  >
                    <SelectTrigger className="bg-[#222] border-[#444] text-white">
                      <SelectValue placeholder="Selecione um servidor MCP" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#222] border-[#444] text-white">
                      {availableMCPs.map((mcp) => (
                        <SelectItem key={mcp.id} value={mcp.id}>
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-[#00ff9d]" />
                            {mcp.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMCP && (
                  <>
                    <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                      <p className="font-medium text-white">{selectedMCP.name}</p>
                      <p className="text-sm text-gray-400">{selectedMCP.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        <p>
                          <strong>Tipo:</strong> {selectedMCP.type}
                        </p>
                        <p>
                          <strong>Configuração:</strong> {selectedMCP.config_type === "sse" ? "SSE" : "Studio"}
                        </p>
                      </div>
                    </div>

                    {/* Variáveis de ambiente */}
                    {Object.keys(selectedMCP.environments).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white">Variáveis de Ambiente</h3>
                        {Object.entries(selectedMCP.environments).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`env-${key}`} className="text-right text-gray-300">
                              {key}
                            </Label>
                            <Input
                              id={`env-${key}`}
                              value={mcpEnvs[key] || ""}
                              onChange={(e) => setMcpEnvs({ ...mcpEnvs, [key]: e.target.value })}
                              className="col-span-2 bg-[#222] border-[#444] text-white"
                              placeholder={value}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ferramentas disponíveis */}
                    {selectedMCP.tools.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white">Ferramentas Disponíveis</h3>
                        <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                          {selectedMCP.tools.map((tool) => (
                            <div key={tool} className="flex items-center space-x-2 py-1">
                              <Checkbox
                                id={`tool-${tool}`}
                                checked={selectedMCPTools.includes(tool)}
                                onCheckedChange={() => toggleMCPTool(tool)}
                                className="border-[#00ff9d] data-[state=checked]:bg-[#00ff9d] data-[state=checked]:text-black"
                              />
                              <Label htmlFor={`tool-${tool}`} className="cursor-pointer text-gray-300">
                                {tool}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsMCPDialogOpen(false)}
                className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddMCP}
                disabled={!selectedMCP}
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para configuração de ferramenta */}
        <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-white">Configurar Ferramenta</DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecione uma ferramenta e configure suas variáveis de ambiente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tool-select" className="text-gray-300">
                  Ferramenta
                </Label>
                <Select
                  value={selectedTool?.id}
                  onValueChange={(value) => {
                    const tool = availableTools.find((t) => t.id === value)
                    if (tool) {
                      setSelectedTool(tool)
                      // Inicializar variáveis de ambiente
                      const initialEnvs: Record<string, string> = {}
                      Object.keys(tool.envs).forEach((key) => {
                        initialEnvs[key] = ""
                      })
                      setToolEnvs(initialEnvs)
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#222] border-[#444] text-white">
                    <SelectValue placeholder="Selecione uma ferramenta" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#444] text-white">
                    {availableTools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        <div className="flex items-center gap-2">
                          <ToolIcon className="h-4 w-4 text-[#00ff9d]" />
                          {tool.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTool && (
                <>
                  <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                    <p className="font-medium text-white">{selectedTool.name}</p>
                    <p className="text-sm text-gray-400">{selectedTool.description}</p>
                  </div>

                  {/* Variáveis de ambiente */}
                  {Object.keys(selectedTool.envs).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-white">Variáveis de Ambiente</h3>
                      {Object.keys(selectedTool.envs).map((key) => (
                        <div key={key} className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor={`tool-env-${key}`} className="text-right text-gray-300">
                            {key}
                          </Label>
                          <Input
                            id={`tool-env-${key}`}
                            value={toolEnvs[key] || ""}
                            onChange={(e) => setToolEnvs({ ...toolEnvs, [key]: e.target.value })}
                            className="col-span-2 bg-[#222] border-[#444] text-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsToolDialogOpen(false)}
                className="border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddTool}
                disabled={!selectedTool}
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className="overflow-hidden bg-[#1a1a1a] border-[#333] hover:border-[#00ff9d]/50 transition-colors"
          >
            <CardHeader className={`${agent.color} text-black rounded-t-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {getAgentTypeIcon(agent.type)}
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                  </div>
                  <Badge className="mt-1 bg-black/20 text-black border-none">{getAgentTypeName(agent.type)}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-black hover:bg-black/20"
                    onClick={() => handleEditAgent(agent)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-black hover:bg-black/20"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-300 mb-3">{agent.description}</p>

              {agent.type === "llm" && (
                <div className="space-y-1 text-xs text-gray-400">
                  <div>
                    <strong>Modelo:</strong> {agent.model}
                  </div>
                  {agent.instruction && (
                    <div>
                      <strong>Instruções:</strong>{" "}
                      {agent.instruction.length > 60 ? `${agent.instruction.substring(0, 60)}...` : agent.instruction}
                    </div>
                  )}
                </div>
              )}

              {agent.type === "a2a" && (
                <div className="space-y-1 text-xs text-gray-400">
                  <div>
                    <strong>Agent Card URL:</strong> <span className="truncate block">{agent.agent_card_url}</span>
                  </div>
                </div>
              )}

              {agent.type === "loop" && (
                <div className="space-y-1 text-xs text-gray-400">
                  <div>
                    <strong>Máx. Iterações:</strong> {agent.config.max_iterations}
                  </div>
                </div>
              )}

              {newAgent.config?.mcp_servers && newAgent.config.mcp_servers.length > 0 ? (
                <div className="space-y-2">
                  {newAgent.config.mcp_servers.map((mcp) => (
                    <div key={mcp.id} className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md">
                      <div>
                        <p className="font-medium text-white">{mcp.name}</p>
                        <p className="text-sm text-gray-400">{mcp.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              mcp.config_type === "studio"
                                ? "bg-[#ff9d00]/10 text-[#ff9d00] border-[#ff9d00]/30"
                                : "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30"
                            }`}
                          >
                            {mcp.config_type === "studio" ? "Studio" : "SSE"}
                          </Badge>
                          {mcp.selected_tools && mcp.selected_tools.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {mcp.selected_tools.map((tool) => (
                                <Badge
                                  key={tool}
                                  variant="outline"
                                  className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                                >
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenMCPDialog(mcp)}
                          className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                        >
                          <Settings className="h-4 w-4 mr-1" /> Configurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMCP(mcp.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-300 mb-1">MCP Servers:</div>
                  <div className="flex flex-wrap gap-1">Sem servidores MCP configurados</div>
                </div>
              )}

              {agent.config.tools && agent.config.tools.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-300 mb-1">Ferramentas:</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.config.tools.map((tool) => (
                      <Badge key={tool.id} variant="outline" className="text-xs border-[#444] text-[#00ff9d]">
                        {tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {agent.config.sub_agents && agent.config.sub_agents.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-300 mb-1">Sub-agentes:</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.config.sub_agents.map((subAgentId) => (
                      <Badge key={subAgentId} variant="outline" className="text-xs border-[#444] text-[#00ff9d]">
                        {getAgentNameById(subAgentId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-3">
                <strong>ID:</strong> {agent.id}
              </div>
            </CardContent>
            <CardFooter className="border-t border-[#333] pt-3 flex justify-between">
              <div className="text-xs text-gray-500">
                <strong>ID:</strong> {agent.id}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
