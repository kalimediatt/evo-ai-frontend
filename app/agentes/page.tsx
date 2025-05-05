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
  X,
  Settings,
  Copy,
  Eye,
  EyeOff,
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
import { Agent, AgentCreate, AgentType, ToolConfig as AgentToolConfig, MCPServerConfig, AgentConfig } from "@/types/agent"
import { MCPServer, ToolConfig } from "@/types/mcpServer"
import { listAgents, createAgent, updateAgent, deleteAgent } from "@/services/agentService"
import { listMCPServers } from "@/services/mcpServerService"


export default function AgentsPage() {
  const { toast } = useToast()

  // Buscar client_id do usuário logado
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {}
  const clientId = user?.client_id || ""

  // Lista de MCPs disponíveis
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([])

  // Estado para agentes
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carregar agentes da API
  useEffect(() => {
    if (!clientId) return
    setIsLoading(true)
    listAgents(clientId)
      .then(res => setAgents(res.data))
      .catch(() => toast({ title: "Erro ao carregar agentes", variant: "destructive" }))
      .finally(() => setIsLoading(false))
  }, [clientId])

  // Carregar MCPs da API
  useEffect(() => {
    setIsLoading(true)
    listMCPServers()
      .then(res => setAvailableMCPs(res.data))
      .catch(() => toast({ title: "Erro ao carregar servidores MCP", variant: "destructive" }))
      .finally(() => setIsLoading(false))
  }, [])

  // Estado inicial
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    client_id: clientId || "",
    name: "",
    description: "",
    type: "llm",
    model: "gpt-4.1-nano",
    instruction: "",
    config: {
      api_key: "",
      tools: [],
      mcp_servers: [],
      custom_tools: {
        http_tools: [],
      },
      sub_agents: [],
    } // Agora usando a tipagem unificada AgentConfig
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
  const [selectedTool, setSelectedTool] = useState<AgentToolConfig | null>(null)
  const [toolEnvs, setToolEnvs] = useState<Record<string, string>>({})

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  const [isApiKeyVisible, setIsApiKeyVisible] = useState<boolean>(false);

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
    // Série GPT-4.1
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    
    // GPT-4.5 Preview
    { value: "gpt-4.5-preview", label: "GPT-4.5 Preview" },
    
    // GPT-4 Turbo & GPT-4o
    { value: "gpt-4", label: "GPT-4 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    
    // GPT-4 Legacy
    { value: "gpt-4-32k", label: "GPT-4 32K" },
    
    // Série GPT-3.5 Turbo
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-3.5-turbo-16k", label: "GPT-3.5 Turbo 16K" },
    
    // Modelos Claude
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  ]

  // Efeito para atualizar o formulário com base no tipo de agente
  useEffect(() => {
    if (newAgent.type === "llm") {
      setNewAgent((prev) => ({
        ...prev,
        model: prev.model || "gpt-4.1-nano",
        instruction: prev.instruction || "",
        agent_card_url: undefined,
        config: {
          api_key: prev.api_key || "",
          tools: [],
          mcp_servers: [],
          custom_tools: {
            http_tools: [],
          },
          sub_agents: [],
        } // Usando AgentConfig unificado
      }))
    } else if (newAgent.type === "a2a") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: prev.agent_card_url || "http://localhost:8001/api/v1/a2a/agent/.well-known/agent.json",
        config: undefined // A2A não precisa de config
      }))
    } else if (newAgent.type === "loop") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        config: {
          sub_agents: [],
          max_iterations: 5,
        } // Usando AgentConfig unificado
      }))
    } else {
      // sequential ou parallel
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        config: {
          sub_agents: [],
        } // Usando AgentConfig unificado
      }))
    }
  }, [newAgent.type])

  // Adicionar ou editar agente
  const handleAddAgent = async () => {
    if (!newAgent.name) {
      toast({ title: "Campo obrigatório", description: "Nome do agente é obrigatório", variant: "destructive" })
      return
    }
    try {
      setIsLoading(true)
    if (editingAgent) {
        await updateAgent(editingAgent.id, { ...newAgent, client_id: clientId })
        toast({ title: "Agente atualizado", description: `${newAgent.name} foi atualizado com sucesso` })
    } else {
        await createAgent({ ...(newAgent as AgentCreate), client_id: clientId })
        toast({ title: "Agente adicionado", description: `${newAgent.name} foi adicionado com sucesso` })
      }
      // Recarregar lista
      const res = await listAgents(clientId)
      setAgents(res.data)
    setIsDialogOpen(false)
      resetForm()
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar o agente", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Excluir agente
  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return
    try {
      setIsLoading(true)
      await deleteAgent(agentToDelete.id)
      toast({ title: "Agente excluído", description: "O agente foi excluído com sucesso" })
      // Recarregar lista
      const res = await listAgents(clientId)
      setAgents(res.data)
      setAgentToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir o agente", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Editar agente
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setNewAgent({ ...agent })
    setActiveTab("basic")
    setIsDialogOpen(true)
  }

  // Resetar o formulário
  const resetForm = () => {
    setNewAgent({
      client_id: clientId || "",
      name: "",
      description: "",
      type: "llm",
      model: "gpt-4.1-nano",
      instruction: "",
      config: {
        api_key: "",
        tools: [],
        mcp_servers: [],
        custom_tools: {
          http_tools: [],
        },
        sub_agents: [],
      } // Usando AgentConfig unificado
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
  const handleOpenMCPDialog = (mcp?: any) => {
    if (mcp) {
      // Se for um MCP de configuração existente (contém apenas ID, envs e tools)
      if (!mcp.name) {
        // Buscar o MCP completo da lista de disponíveis
        const fullMCP = availableMCPs.find(m => m.id === mcp.id);
        if (fullMCP) {
          setSelectedMCP(fullMCP);
          setMcpEnvs(mcp.envs || {});
          setSelectedMCPTools(mcp.tools || []);
        } else {
          toast({
            title: "Erro",
            description: "MCP não encontrado na lista de disponíveis",
            variant: "destructive",
          });
          return;
        }
      } else {
        // É um MCP completo da lista
        setSelectedMCP(mcp);
        setMcpEnvs(mcp.envs || {});
        setSelectedMCPTools(mcp.selected_tools || []);
      }
    } else {
      // Valor padrão para um novo MCP
      setSelectedMCP(null);
      setMcpEnvs({});
      setSelectedMCPTools([]);
    }
    setIsMCPDialogOpen(true);
  };

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

    // Verificar se o config existe antes de adicionar MCPs
    if (newAgent.config) {
      const mcp = { ...selectedMCP }
      
      // Criar uma configuração MCPServerConfig
      const mcpConfig: MCPServerConfig = {
        id: mcp.id,
        envs: mcpEnvs,
        tools: selectedMCPTools,
      }

      const existingMCPIndex = newAgent.config.mcp_servers?.findIndex((mcpItem) => mcpItem.id === selectedMCP.id)

      if (existingMCPIndex !== undefined && existingMCPIndex >= 0) {
        // Atualizar MCP existente
        const updatedMCPs = [...(newAgent.config.mcp_servers || [])]
        updatedMCPs[existingMCPIndex] = mcpConfig

        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            mcp_servers: updatedMCPs,
          }
        })
      } else {
        // Adicionar novo MCP
        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            mcp_servers: [...(newAgent.config.mcp_servers || []), mcpConfig],
          }
        })
      }

      setIsMCPDialogOpen(false)
      toast({
        title: "MCP configurado",
        description: `${mcp.name} foi configurado com sucesso`,
      })
    } else {
      toast({
        title: "Erro",
        description: "O tipo de agente atual não suporta servidores MCP",
        variant: "destructive",
      })
    }
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
  const handleOpenToolDialog = (tool?: AgentToolConfig) => {
    if (tool) {
      setSelectedTool(tool)
      setToolEnvs(tool.envs || {})
    } else {
      setSelectedTool(null)
      setToolEnvs({})
    }
    setIsToolDialogOpen(true)
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
  const toggleMCPTool = (tool: any) => {
    if (selectedMCPTools.includes(tool)) {
      setSelectedMCPTools(selectedMCPTools.filter((t) => t !== tool))
    } else {
      setSelectedMCPTools([...selectedMCPTools, tool])
    }
  }

  // Função para copiar texto para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ 
        title: "Copiado!",
        description: "Valor copiado para a área de transferência"
      });
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
      toast({ 
        title: "Erro ao copiar",
        description: "Não foi possível copiar o valor",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen rounded-lg">
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
                      onValueChange={(value: AgentType) => setNewAgent({ ...newAgent, type: value } as Partial<Agent> & { type?: string })}
                    >
                      <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222] border-[#444] text-white">
                        {agentTypes.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                          >
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
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value } as Partial<Agent> & { name?: string })}
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
                      onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value } as Partial<Agent> & { description?: string })}
                      className="col-span-3 bg-[#222] border-[#444] text-white"
                    />
                  </div>

                  {newAgent.type === "llm" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right text-gray-300">
                          Modelo
                        </Label>
                        <Select
                          value={newAgent.model}
                          onValueChange={(value) => setNewAgent({ ...newAgent, model: value } as Partial<Agent> & { model?: string })}
                        >
                          <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#222] border-[#444] text-white">
                            {availableModels.map((model) => (
                              <SelectItem 
                                key={model.value} 
                                value={model.value}
                                className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                              >
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
                          onChange={(e) => setNewAgent({ ...newAgent, api_key: e.target.value } as Partial<Agent> & { api_key?: string })}
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
                          onChange={(e) => setNewAgent({ ...newAgent, instruction: e.target.value } as Partial<Agent> & { instruction?: string })}
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
                        onChange={(e) => setNewAgent({ ...newAgent, agent_card_url: e.target.value } as Partial<Agent> & { agent_card_url?: string })}
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
                          } as Partial<Agent> & { config?: AgentConfig })
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
                        <h3 className="text-lg font-medium text-white">Servidores MCP</h3>
                        <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                          <p className="text-sm text-gray-400 mb-4">
                            Configure os servidores MCP que este agente pode utilizar.
                          </p>

                          {newAgent.config?.mcp_servers && newAgent.config.mcp_servers.length > 0 ? (
                            <div className="space-y-2">
                              {newAgent.config.mcp_servers.map((mcpConfig) => {
                                // Encontrar o servidor MCP correspondente para obter name e description
                                const mcpServer = availableMCPs.find(mcp => mcp.id === mcpConfig.id);
                                return (
                                  <div
                                    key={mcpConfig.id}
                                    className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                  >
                                    <div>
                                      <p className="font-medium text-white">{mcpServer?.name || mcpConfig.id}</p>
                                      <p className="text-sm text-gray-400">{mcpServer?.description?.substring(0, 100)}...</p>
                                      {mcpConfig.tools && mcpConfig.tools.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {mcpConfig.tools.map((toolId) => (
                                            <Badge
                                              key={toolId}
                                              variant="outline"
                                              className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                                            >
                                              {toolId}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenMCPDialog(mcpConfig)}
                                        className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                      >
                                        <Settings className="h-4 w-4 mr-1" /> Configurar
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveMCP(mcpConfig.id)}
                                        className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Botão para adicionar mais servidores MCP, sempre visível */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenMCPDialog()}
                                className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
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
                                className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Adicionar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* API Key Display Section */}
                      {editingAgent && (editingAgent.config?.api_key || "not defined") && (
                        <div className="mt-6 space-y-2">
                          <h3 className="text-lg font-medium text-white">Informações de Segurança</h3>
                          <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-300 block mb-2">API Key</Label>
                                <div className="flex items-center">
                                  <div className="relative flex-1">
                                    <div className="bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-[#00ff9d] font-mono text-sm relative overflow-hidden">
                                      {isApiKeyVisible 
                                        ? (editingAgent.config?.api_key || "not defined")
                                        : '•'.repeat(Math.min(16, (editingAgent.config?.api_key || "not defined" || "").length))}
                                    </div>
                                  </div>
                                  <div className="flex ml-2 space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 bg-[#333] text-white hover:bg-[#444] hover:text-[#00ff9d]"
                                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                                      title={isApiKeyVisible ? "Ocultar API Key" : "Mostrar API Key"}
                                    >
                                      {isApiKeyVisible ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 bg-[#333] text-white hover:bg-[#444] hover:text-[#00ff9d]"
                                      onClick={() => copyToClipboard(editingAgent.config?.api_key || "not defined" || "")}
                                      title="Copiar API Key"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                  Esta é a chave de API do seu agente. Mantenha-a segura e não compartilhe com terceiros.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                                <span className="font-medium text-white">{agent.name}</span>
                                <Badge variant="outline" className="ml-2 border-[#444] text-[#00ff9d]">
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
                                    ? "text-gray-500 bg-[#222] hover:bg-[#333]"
                                    : "text-[#00ff9d] hover:bg-[#333] bg-[#222]"
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
                className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
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
              <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
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
                        <SelectItem 
                          key={mcp.id} 
                          value={mcp.id}
                          className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                        >
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
                      <p className="text-sm text-gray-400">{selectedMCP.description?.substring(0, 100)}...</p>
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
                    {selectedMCP.environments && Object.keys(selectedMCP.environments).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white">Variáveis de Ambiente</h3>
                        {Object.entries(selectedMCP.environments || {}).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`env-${key}`} className="text-right text-gray-300">
                              {key}
                            </Label>
                            <Input
                              id={`env-${key}`}
                              value={mcpEnvs[key] || ""}
                              onChange={(e) => setMcpEnvs({ ...mcpEnvs, [key]: e.target.value })}
                              className="col-span-2 bg-[#222] border-[#444] text-white"
                              placeholder={value as string}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ferramentas disponíveis */}
                    {selectedMCP.tools && selectedMCP.tools.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-white">Ferramentas Disponíveis</h3>
                        <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                          {selectedMCP.tools.map((tool) => (
                            <div key={tool.id} className="flex items-center space-x-2 py-1">
                              <Checkbox
                                id={`tool-${tool.id}`}
                                checked={selectedMCPTools.includes(tool.id)}
                                onCheckedChange={() => toggleMCPTool(tool.id)}
                              />
                              <Label htmlFor={`tool-${tool.id}`} className="text-sm text-gray-300">
                                {tool.name}
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
            
            <DialogFooter className="p-4 pt-2 border-t border-[#333]">
              <Button
                variant="outline"
                onClick={() => setIsMCPDialogOpen(false)}
                className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddMCP} 
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                disabled={!selectedMCP}
              >
                Adicionar MCP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de agentes ou mensagem quando não há agentes */}
      {agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="overflow-hidden bg-[#1a1a1a] border-[#333] hover:border-[#00ff9d]/50 hover:shadow-[0_0_15px_rgba(0,255,157,0.15)] transition-all rounded-xl"
            >
              <CardHeader className="bg-[#222] text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {getAgentTypeIcon(agent.type)}
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                    </div>
                    <Badge className="mt-1 bg-[#333] text-[#00ff9d] border-none">{getAgentTypeName(agent.type)}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-[#333]/50 hover:text-[#00ff9d]"
                      onClick={() => handleEditAgent(agent)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-[#333]/50 hover:text-[#00ff9d]"
                      onClick={() => {
                        setAgentToDelete(agent);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-300 mb-3">{agent.description?.substring(0, 100)}...</p>

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

                {agent.type === "loop" && agent.config?.max_iterations && (
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>
                      <strong>Máx. Iterações:</strong> {agent.config.max_iterations}
                    </div>
                  </div>
                )}

                {agent.config?.sub_agents && agent.config.sub_agents.length > 0 && (
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

                {agent.type === "llm" && agent.config?.mcp_servers && agent.config.mcp_servers.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-300 mb-1">Servidores MCP:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.config.mcp_servers.map((mcpConfig) => {
                        // Encontrar o servidor MCP correspondente para obter o nome
                        const mcpServer = availableMCPs.find(mcp => mcp.id === mcpConfig.id);
                        // Contar ferramentas deste MCP
                        const toolCount = mcpConfig.tools?.length || 0;
                        
                        return (
                          <Badge 
                            key={mcpConfig.id} 
                            variant="outline" 
                            className="text-xs border-[#444] text-white bg-[#333]"
                          >
                            <span className="flex items-center gap-1">
                              <Server className="h-3 w-3 text-[#00ff9d]" />
                              {mcpServer?.name || mcpConfig.id}
                              {toolCount > 0 && (
                                <span className="ml-1 bg-[#00ff9d] text-black text-[9px] px-1 rounded-full">
                                  {toolCount}
                                </span>
                              )}
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {/* Total de ferramentas em todos os MCPs */}
                    {agent.config.mcp_servers.some(mcp => mcp.tools && mcp.tools.length > 0) && (
                      <div className="mt-1 text-xs text-gray-400">
                        <strong>Total de Ferramentas:</strong> {agent.config.mcp_servers.reduce((total, mcp) => total + (mcp.tools?.length || 0), 0)}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3">
                  <strong>ID:</strong> {agent.id}
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333] pt-3 flex justify-between">
                <div className="text-xs text-gray-500">
                  <strong>Criado em:</strong> {new Date(agent.created_at).toLocaleString()}
                </div>
                {agent.agent_card_url && (
                  <a 
                    href={agent.agent_card_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs flex items-center gap-1 bg-[#333] text-[#00ff9d] hover:bg-[#444] px-2 py-1 rounded-md transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Cartão do Agente
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="mb-6 p-8 rounded-full bg-[#1a1a1a] border border-[#333]">
            <Server className="h-16 w-16 text-[#00ff9d]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Nenhum agente encontrado</h2>
          <p className="text-gray-300 mb-6 max-w-md">
            Você ainda não tem nenhum agente configurado. Crie seu primeiro agente para começar!
          </p>
          <Button
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] px-6 py-2 hover:shadow-[0_0_15px_rgba(0,255,157,0.2)]"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar Agente
          </Button>
        </div>
      )}
    </div>
  )
}