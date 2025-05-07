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
  Search,
  Folder,
  FolderPlus,
  MoveRight,
  Home,
  CircleEllipsis,
  Key,
  Info,
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
import { Agent, AgentCreate, AgentType, ToolConfig as AgentToolConfig, MCPServerConfig, AgentConfig, CustomMCPServer } from "@/types/agent"
import { MCPServer, ToolConfig } from "@/types/mcpServer"
import { listAgents, createAgent, updateAgent, deleteAgent, Folder as FolderType, listFolders, createFolder, updateFolder, deleteFolder, assignAgentToFolder, ApiKey, listApiKeys, createApiKey, updateApiKey, deleteApiKey } from "@/services/agentService"
import { listMCPServers } from "@/services/mcpServerService"
import { useRouter } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function AgentsPage() {
  const { toast } = useToast()
  const router = useRouter()

  // Buscar client_id do usuário logado
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {}
  const clientId = user?.client_id || ""

  // Estado para controlar a visibilidade do sidebar de pastas
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)

  // Lista de MCPs disponíveis
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([])

  // Estado para as API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false)
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false)
  const [isAddingApiKey, setIsAddingApiKey] = useState(false)
  const [isEditingApiKey, setIsEditingApiKey] = useState(false)
  const [currentApiKey, setCurrentApiKey] = useState<Partial<ApiKey & { key_value?: string }>>({})
  const [isDeleteApiKeyDialogOpen, setIsDeleteApiKeyDialogOpen] = useState(false)
  const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null)

  // Estado para agentes
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Estados para o sistema de pastas
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null)
  const [newFolder, setNewFolder] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  })
  const [isFolderDeleteDialogOpen, setIsFolderDeleteDialogOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null)
  const [isMovingAgent, setIsMovingAgent] = useState(false)
  const [agentToMove, setAgentToMove] = useState<Agent | null>(null)
  const [isMovingDialogOpen, setIsMovingDialogOpen] = useState(false)

  // Carregar agentes da API
  useEffect(() => {
    if (!clientId) return
    loadAgents()
  }, [clientId, selectedFolderId])

  // Função para carregar agentes com base na pasta selecionada
  const loadAgents = async () => {
    setIsLoading(true)
    try {
      const res = await listAgents(clientId, 0, 100, selectedFolderId || undefined)
      setAgents(res.data)
      setFilteredAgents(res.data)
    } catch (error) {
      toast({ title: "Erro ao carregar agentes", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar pastas
  useEffect(() => {
    if (!clientId) return
    setIsLoading(true)
    listFolders(clientId)
      .then(res => setFolders(res.data))
      .catch(() => toast({ title: "Erro ao carregar pastas", variant: "destructive" }))
      .finally(() => setIsLoading(false))
  }, [clientId])

  // Filtrar agentes quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgents(agents)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = agents.filter(
        agent => 
          agent.name.toLowerCase().includes(lowercaseSearch) || 
          agent.description?.toLowerCase().includes(lowercaseSearch) ||
          getAgentTypeName(agent.type).toLowerCase().includes(lowercaseSearch)
      )
      setFilteredAgents(filtered)
    }
  }, [searchTerm, agents])

  // Carregar MCPs da API
  useEffect(() => {
    setIsLoading(true)
    listMCPServers()
      .then(res => setAvailableMCPs(res.data))
      .catch(() => toast({ title: "Erro ao carregar servidores MCP", variant: "destructive" }))
      .finally(() => setIsLoading(false))
  }, [])

  // Carregar API Keys
  useEffect(() => {
    if (!clientId) return
    loadApiKeys()
  }, [clientId])

  // Função para carregar chaves de API
  const loadApiKeys = async () => {
    setIsLoadingApiKeys(true)
    try {
      const res = await listApiKeys(clientId)
      setApiKeys(res.data)
    } catch (error) {
      toast({ title: "Erro ao carregar chaves de API", variant: "destructive" })
    } finally {
      setIsLoadingApiKeys(false)
    }
  }

  // Função para adicionar ou atualizar uma chave de API
  const handleSaveApiKey = async () => {
    if (!currentApiKey.name || !currentApiKey.provider || !currentApiKey.key_value) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Nome, provedor e valor da chave são obrigatórios", 
        variant: "destructive" 
      })
      return
    }

    try {
      setIsLoadingApiKeys(true)
      if (currentApiKey.id) {
        // Atualizar chave existente
        await updateApiKey(
          currentApiKey.id, 
          { 
            name: currentApiKey.name, 
            provider: currentApiKey.provider, 
            key_value: currentApiKey.key_value,
            is_active: currentApiKey.is_active
          }, 
          clientId
        )
        toast({ title: "Chave atualizada", description: "A chave de API foi atualizada com sucesso" })
      } else {
        // Criar nova chave
        await createApiKey({
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value,
          client_id: clientId
        })
        toast({ title: "Chave adicionada", description: "A chave de API foi adicionada com sucesso" })
      }
      
      // Limpar formulário e recarregar lista
      setCurrentApiKey({})
      setIsAddingApiKey(false)
      setIsEditingApiKey(false)
      loadApiKeys()
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar a chave de API", variant: "destructive" })
    } finally {
      setIsLoadingApiKeys(false)
    }
  }

  // Função para excluir uma chave de API
  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) return
    try {
      setIsLoadingApiKeys(true)
      await deleteApiKey(apiKeyToDelete.id, clientId)
      toast({ title: "Chave excluída", description: "A chave de API foi excluída com sucesso" })
      
      // Limpar e recarregar lista
      setApiKeyToDelete(null)
      setIsDeleteApiKeyDialogOpen(false)
      loadApiKeys()
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir a chave de API", variant: "destructive" })
    } finally {
      setIsLoadingApiKeys(false)
    }
  }

  // Função para editar uma chave de API
  const handleEditApiKey = (apiKey: ApiKey) => {
    setCurrentApiKey({ ...apiKey, key_value: '' }) // Não incluímos o valor real da chave
    setIsEditingApiKey(true)
    setIsAddingApiKey(true)
  }

  // Funções para gerenciamento de pastas
  
  const handleAddFolder = async () => {
    if (!newFolder.name) {
      toast({ title: "Campo obrigatório", description: "Nome da pasta é obrigatório", variant: "destructive" })
      return
    }
    try {
      setIsLoading(true)
      if (editingFolder) {
        await updateFolder(editingFolder.id, newFolder, clientId)
        toast({ title: "Pasta atualizada", description: `${newFolder.name} foi atualizada com sucesso` })
      } else {
        await createFolder({
          ...newFolder,
          client_id: clientId,
        })
        toast({ title: "Pasta criada", description: `${newFolder.name} foi criada com sucesso` })
      }
      // Recarregar pastas
      const res = await listFolders(clientId)
      setFolders(res.data)
      setIsFolderDialogOpen(false)
      resetFolderForm()
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar a pasta", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder(folder)
    setNewFolder({
      name: folder.name,
      description: folder.description,
    })
    setIsFolderDialogOpen(true)
  }
  
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return
    try {
      setIsLoading(true)
      await deleteFolder(folderToDelete.id, clientId)
      toast({ title: "Pasta excluída", description: "A pasta foi excluída com sucesso" })
      // Recarregar pastas
      const res = await listFolders(clientId)
      setFolders(res.data)
      // Se a pasta excluída era a selecionada, voltar para "Todos os agentes"
      if (selectedFolderId === folderToDelete.id) {
        setSelectedFolderId(null)
      }
      setFolderToDelete(null)
      setIsFolderDeleteDialogOpen(false)
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir a pasta", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetFolderForm = () => {
    setNewFolder({
      name: "",
      description: "",
    })
    setEditingFolder(null)
  }
  
  const handleMoveAgent = async (targetFolderId: string | null) => {
    if (!agentToMove) return
    try {
      setIsLoading(true)
      await assignAgentToFolder(agentToMove.id, targetFolderId, clientId)
      toast({ 
        title: "Agente movido", 
        description: targetFolderId 
          ? `Agente movido para a pasta com sucesso` 
          : "Agente removido da pasta com sucesso" 
      })
      setIsMovingDialogOpen(false)
      loadAgents()
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível mover o agente", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setAgentToMove(null)
    }
  }
  
  // Funções para iniciar o processo de mover um agente
  const startMoveAgent = (agent: Agent) => {
    setAgentToMove(agent)
    setIsMovingDialogOpen(true)
  }

  // Estado inicial
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    client_id: clientId || "",
    name: "",
    description: "",
    type: "llm",
    model: "gpt-4.1-nano",
    instruction: "",
    api_key_id: "",
    config: {
      tools: [],
      mcp_servers: [],
      custom_mcp_servers: [],
      custom_tools: {
        http_tools: [],
      },
      sub_agents: [],
    } // Usando AgentConfig unificado
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

  // Estado para o diálogo de MCP customizado
  const [isCustomMCPDialogOpen, setIsCustomMCPDialogOpen] = useState(false);
  const [selectedCustomMCP, setSelectedCustomMCP] = useState<CustomMCPServer | null>(null);
  const [customMCPHeaders, setCustomMCPHeaders] = useState<Record<string, string>>({});
  const [customMCPHeadersList, setCustomMCPHeadersList] = useState<{id: string; key: string; value: string}[]>([]);

  // Tipos de agentes
  const agentTypes = [
    { value: "llm", label: "LLM Agent", icon: Code },
    { value: "a2a", label: "A2A Agent", icon: ExternalLink },
    { value: "sequential", label: "Sequential Agent", icon: Workflow },
    { value: "parallel", label: "Parallel Agent", icon: GitBranch },
    { value: "loop", label: "Loop Agent", icon: RefreshCw },
    { value: "workflow", label: "Workflow Agent", icon: Workflow },
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
        api_key_id: prev.api_key_id || "",
        config: {
          tools: [],
          mcp_servers: [],
          custom_mcp_servers: [],
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
        agent_card_url: prev.agent_card_url || "",
        api_key_id: undefined,
        config: undefined // A2A não precisa de config
      }))
    } else if (newAgent.type === "loop") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          custom_mcp_servers: [],
        } // Usando AgentConfig unificado
      }))
    } else if (newAgent.type === "workflow") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          workflow: {
            nodes: [],
            edges: [],
          },
        } // Configuração para workflow
      }))
    } else {
      // sequential ou parallel
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          custom_mcp_servers: [],
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

    // Verificar se é um agente LLM e se a API Key é necessária
    if (newAgent.type === "llm" && !newAgent.api_key_id) {
      toast({ 
        title: "API Key necessária", 
        description: "Selecione uma chave de API para o agente", 
        variant: "destructive" 
      })
      return
    }

    try {
      // Remover o campo api_key se estiver presente
      const agentData = { ...newAgent }

      setIsLoading(true)
      if (editingAgent) {
        await updateAgent(editingAgent.id, { ...agentData, client_id: clientId })
        toast({ title: "Agente atualizado", description: `${newAgent.name} foi atualizado com sucesso` })
      } else {
        const createdAgent = await createAgent({ ...(agentData as AgentCreate), client_id: clientId })
        
        // Se tiver uma pasta selecionada, adicionar o agente a ela
        if (selectedFolderId && createdAgent.data.id) {
          await assignAgentToFolder(createdAgent.data.id, selectedFolderId, clientId)
        }
        
        toast({ title: "Agente adicionado", description: `${newAgent.name} foi adicionado com sucesso` })
      }
      // Recarregar lista
      loadAgents()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar agente:", error)
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
      loadAgents()
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
      api_key_id: "",
      config: {
        tools: [],
        mcp_servers: [],
        custom_mcp_servers: [],
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

  // Função para abrir o diálogo de MCP customizado
  const handleOpenCustomMCPDialog = (customMCP?: CustomMCPServer) => {
    if (customMCP) {
      setSelectedCustomMCP(customMCP);
      // Converter o objeto de headers para um array de {id, key, value}
      const headersList = Object.entries(customMCP.headers || {}).map(([key, value], index) => ({
        id: `header-${index}`,
        key,
        value
      }));
      setCustomMCPHeadersList(headersList);
    } else {
      setSelectedCustomMCP(null);
      setCustomMCPHeadersList([]);
    }
    setIsCustomMCPDialogOpen(true);
  };

  // Função para adicionar/atualizar um MCP customizado
  const handleAddCustomMCP = () => {
    if (!selectedCustomMCP?.url) {
      toast({
        title: "Erro",
        description: "A URL do MCP customizado é obrigatória",
        variant: "destructive",
      });
      return;
    }

    // Verificar se o config existe antes de adicionar MCPs
    if (newAgent.config) {
      // Converter a lista de headers de volta para um objeto Record
      const headersObject: Record<string, string> = {};
      customMCPHeadersList.forEach(header => {
        if (header.key.trim()) {
          headersObject[header.key] = header.value;
        }
      });

      const customMCPConfig: CustomMCPServer = {
        url: selectedCustomMCP.url,
        headers: headersObject,
      };

      const existingCustomMCPIndex = newAgent.config.custom_mcp_servers?.findIndex(
        (customMCP) => customMCP.url === selectedCustomMCP.url
      );

      if (existingCustomMCPIndex !== undefined && existingCustomMCPIndex >= 0) {
        // Atualizar MCP customizado existente
        const updatedCustomMCPs = [...(newAgent.config.custom_mcp_servers || [])];
        updatedCustomMCPs[existingCustomMCPIndex] = customMCPConfig;

        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            custom_mcp_servers: updatedCustomMCPs,
          },
        });
      } else {
        // Adicionar novo MCP customizado
        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            custom_mcp_servers: [...(newAgent.config.custom_mcp_servers || []), customMCPConfig],
          },
        });
      }

      setIsCustomMCPDialogOpen(false);
      toast({
        title: "MCP customizado configurado",
        description: `MCP ${selectedCustomMCP.url} foi configurado com sucesso`,
      });
    } else {
      toast({
        title: "Erro",
        description: "O tipo de agente atual não suporta servidores MCP customizados",
        variant: "destructive",
      });
    }
  };

  // Função para remover um MCP customizado
  const handleRemoveCustomMCP = (url: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        custom_mcp_servers: newAgent.config?.custom_mcp_servers?.filter((customMCP) => customMCP.url !== url) || [],
      },
    });
    toast({
      title: "MCP customizado removido",
      description: "O MCP customizado foi removido com sucesso",
    });
  };

  // Função para obter o nome de uma pasta pelo ID
  const getFolderNameById = (id: string | null) => {
    if (!id) return null
    const folder = folders.find((f) => f.id === id)
    return folder ? folder.name : null
  }

  // Função para obter o nome da chave de API pelo ID
  const getApiKeyNameById = (id: string | undefined) => {
    if (!id) return null
    const apiKey = apiKeys.find((key) => key.id === id)
    return apiKey ? apiKey.name : null
  }

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen flex relative">
      {/* Botão para mostrar/esconder o sidebar */}
      <button
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        className={`absolute left-0 top-6 z-20 bg-[#222] p-2 rounded-r-md text-[#00ff9d] hover:bg-[#333] hover:text-[#00ff9d] shadow-md transition-all ${
          isSidebarVisible ? 'left-64' : 'left-0'
        }`}
        aria-label={isSidebarVisible ? "Esconder pastas" : "Mostrar pastas"}
      >
        {isSidebarVisible ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <Folder className="h-5 w-5" />
            {folders.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#00ff9d] rounded-full border-2 border-[#222]" />
            )}
          </div>
        )}
      </button>

      {/* Overlay escuro quando o sidebar estiver visível */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      {/* Sidebar para pastas com animação */}
      <div 
        className={`absolute top-0 left-0 h-full w-64 bg-[#1a1a1a] p-4 shadow-xl z-20 transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Folder className="h-5 w-5 mr-2 text-[#00ff9d]" />
            Pastas
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#00ff9d] hover:bg-[#222]"
              onClick={() => {
                resetFolderForm()
                setIsFolderDialogOpen(true)
              }}
            >
              <FolderPlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#00ff9d] hover:bg-[#222]"
              onClick={() => setIsSidebarVisible(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <button
            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
              selectedFolderId === null
                ? "bg-[#333] text-[#00ff9d]"
                : "text-gray-300 hover:bg-[#222] hover:text-white"
            }`}
            onClick={() => setSelectedFolderId(null)}
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Todos os agentes</span>
          </button>
          
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center group">
              <button
                className={`flex-1 text-left px-3 py-2 rounded-md flex items-center ${
                  selectedFolderId === folder.id
                    ? "bg-[#333] text-[#00ff9d]"
                    : "text-gray-300 hover:bg-[#222] hover:text-white"
                }`}
                onClick={() => setSelectedFolderId(folder.id)}
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="truncate">{folder.name}</span>
              </button>
              
              <div className="opacity-0 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#222]"
                    >
                      <CircleEllipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#222] border-[#333] text-white">
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditFolder(folder)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFolderToDelete(folder)
                        setIsFolderDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className={`w-full transition-all duration-300 ease-in-out ${isSidebarVisible ? "pl-64" : "pl-0"}`}>
        {/* Título da página e barra de pesquisa */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center ml-4">
              {selectedFolderId ? (
                <>
                  <Folder className="h-6 w-6 mr-2 text-[#00ff9d]" />
                  {getFolderNameById(selectedFolderId)}
                </>
              ) : (
                "Agentes"
              )}
            </h1>
            {selectedFolderId && (
              <p className="text-sm text-gray-400 mt-1">
                {folders.find(f => f.id === selectedFolderId)?.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar agentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[300px] bg-[#222] border-[#444] text-white focus:border-[#00ff9d] focus:ring-[#00ff9d]/10"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              onClick={() => setIsApiKeysDialogOpen(true)}
              className="bg-[#222] text-white hover:bg-[#333] border border-[#444]"
            >
              <Key className="mr-2 h-4 w-4 text-[#00ff9d]" />
              Chaves API
            </Button>

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
                            <div className="col-span-3 space-y-4">
                              <div className="flex items-center">
                                <Select
                                  value={newAgent.api_key_id || ""}
                                  onValueChange={(value) => setNewAgent({
                                    ...newAgent,
                                    api_key_id: value,
                                  })}
                                >
                                  <SelectTrigger className="flex-1 bg-[#222] border-[#444] text-white">
                                    <SelectValue placeholder="Selecione uma chave de API" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#222] border-[#444] text-white">
                                    {apiKeys.length > 0 ? (
                                      apiKeys
                                        .filter(key => key.is_active !== false)
                                        .map((key) => (
                                          <SelectItem
                                            key={key.id}
                                            value={key.id}
                                            className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                                          >
                                            <div className="flex items-center">
                                              <span>{key.name}</span>
                                              <Badge className="ml-2 bg-[#333] text-[#00ff9d] text-xs">
                                                {key.provider}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        ))
                                    ) : (
                                      <div className="text-gray-500 px-2 py-1.5 pl-8">
                                        Nenhuma chave disponível
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsApiKeysDialogOpen(true)}
                                  className="ml-2 bg-[#222] text-[#00ff9d] hover:bg-[#333]"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {apiKeys.length === 0 && (
                                <div className="flex items-center text-xs text-gray-400">
                                  <Info className="h-3 w-3 mr-1 inline" />
                                  <span>
                                    Você precisa <Button variant="link" onClick={() => setIsApiKeysDialogOpen(true)} className="h-auto p-0 text-xs text-[#00ff9d]">
                                      cadastrar chaves de API
                                    </Button> antes de criar um agente.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="instruction" className="text-right text-gray-300">
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

                      {newAgent.type === "loop" && newAgent.config?.max_iterations && (
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>
                            <strong>Máx. Iterações:</strong> {newAgent.config.max_iterations}
                          </div>
                        </div>
                      )}

                      {newAgent.type === "workflow" && (
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>
                            <strong>Tipo:</strong> Fluxo Visual
                          </div>
                          {newAgent.config?.workflow && (
                            <div>
                              <strong>Elementos:</strong> {(newAgent.config.workflow.nodes?.length || 0)} nós, {(newAgent.config.workflow.edges?.length || 0)} conexões
                            </div>
                          )}
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
                          
                          {/* Nova seção para MCPs customizados */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Servidores MCP Customizados</h3>
                            <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                              <p className="text-sm text-gray-400 mb-4">
                                Configure servidores MCP personalizados com URL e cabeçalhos HTTP.
                              </p>

                              {newAgent.config?.custom_mcp_servers && newAgent.config.custom_mcp_servers.length > 0 ? (
                                <div className="space-y-2">
                                  {newAgent.config.custom_mcp_servers.map((customMCP) => (
                                    <div
                                      key={customMCP.url}
                                      className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                    >
                                      <div>
                                        <p className="font-medium text-white">{customMCP.url}</p>
                                        <p className="text-sm text-gray-400">
                                          {Object.keys(customMCP.headers || {}).length > 0
                                            ? `${Object.keys(customMCP.headers || {}).length} cabeçalhos configurados`
                                            : "Sem cabeçalhos configurados"}
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleOpenCustomMCPDialog(customMCP)}
                                          className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                        >
                                          <Settings className="h-4 w-4 mr-1" /> Configurar
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveCustomMCP(customMCP.url)}
                                          className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Botão para adicionar mais MCPs customizados */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCustomMCPDialog()}
                                    className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Adicionar MCP Customizado
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md mb-2">
                                  <div>
                                    <p className="font-medium text-white">Sem MCPs customizados configurados</p>
                                    <p className="text-sm text-gray-400">Adicione MCPs customizados para este agente</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCustomMCPDialog()}
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

                      {(newAgent.type === "sequential" || newAgent.type === "parallel" || newAgent.type === "loop" || newAgent.type === "workflow") && (
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
                          </div>
                </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9d]"></div>
                      </div>
        ) : filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
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
                    
                    {agent.type === "workflow" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-[#333]/50 hover:text-[#00ff9d]"
                        onClick={() => router.push(`/agentes/fluxos?agentId=${agent.id}`)}
                      >
                        <Workflow className="h-4 w-4" />
                      </Button>
                    )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-[#333]/50 hover:text-[#00ff9d]"
                      >
                            <CircleEllipsis className="h-4 w-4" />
                      </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#222] border-[#333] text-white">
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
                            onClick={() => startMoveAgent(agent)}
                          >
                            <MoveRight className="h-4 w-4 mr-2" />
                            Mover para Pasta
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                            onClick={() => {
                              setAgentToDelete(agent);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                    {agent.api_key_id && (
                      <div>
                        <strong>API Key:</strong>{" "}
                        <Badge className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30">
                          {getApiKeyNameById(agent.api_key_id)}
                        </Badge>
                      </div>
                    )}
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

                {agent.type === "workflow" && (
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>
                      <strong>Tipo:</strong> Fluxo Visual
                    </div>
                    {agent.config?.workflow && (
                      <div>
                        <strong>Elementos:</strong> {(agent.config.workflow.nodes?.length || 0)} nós, {(agent.config.workflow.edges?.length || 0)} conexões
                      </div>
                    )}
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

                {agent.type === "llm" && agent.config?.custom_mcp_servers && agent.config.custom_mcp_servers.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-300 mb-1">MCPs Customizados:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.config.custom_mcp_servers.map((customMCP) => (
                        <Badge 
                          key={customMCP.url} 
                          variant="outline" 
                          className="text-xs border-[#444] text-white bg-[#333]"
                        >
                          <span className="flex items-center gap-1">
                            <Server className="h-3 w-3 text-[#00ff9d]" />
                            {customMCP.url.split('//')[1]?.split('/')[0] || customMCP.url}
                            {Object.keys(customMCP.headers || {}).length > 0 && (
                              <span className="ml-1 bg-[#00ff9d] text-black text-[9px] px-1 rounded-full">
                                {Object.keys(customMCP.headers || {}).length}
                              </span>
                            )}
                          </span>
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
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="mb-6 p-8 rounded-full bg-[#1a1a1a] border border-[#333]">
              <Search className="h-16 w-16 text-[#00ff9d]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">Nenhum agente encontrado</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Não encontramos nenhum agente que corresponda à sua busca: "{searchTerm}"
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-[#222] text-white hover:bg-[#333]"
            >
              Limpar busca
            </Button>
          </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="mb-6 p-8 rounded-full bg-[#1a1a1a] border border-[#333]">
              {selectedFolderId ? (
                <Folder className="h-16 w-16 text-[#00ff9d]" />
              ) : (
            <Server className="h-16 w-16 text-[#00ff9d]" />
              )}
          </div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              {selectedFolderId ? "Pasta vazia" : "Nenhum agente encontrado"}
            </h2>
          <p className="text-gray-300 mb-6 max-w-md">
              {selectedFolderId 
                ? "Esta pasta ainda não contém nenhum agente. Adicione agentes ou crie um novo."
                : "Você ainda não tem nenhum agente configurado. Crie seu primeiro agente para começar!"}
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
      
      {/* Diálogo para criar/editar pastas */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Editar Pasta" : "Nova Pasta"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingFolder
                ? "Atualize as informações da pasta existente"
                : "Preencha as informações para criar uma nova pasta"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-gray-300">
                Nome da pasta
              </Label>
              <Input
                id="folder-name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                className="bg-[#222] border-[#444] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="folder-description" className="text-gray-300">
                Descrição (opcional)
              </Label>
              <Textarea
                id="folder-description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                className="bg-[#222] border-[#444] text-white resize-none h-20"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFolderDialogOpen(false)}
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddFolder} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
              {editingFolder ? "Salvar Alterações" : "Criar Pasta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de pasta */}
      <AlertDialog open={isFolderDeleteDialogOpen} onOpenChange={setIsFolderDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir a pasta "{folderToDelete?.name}"? Os agentes não serão excluídos, apenas removidos da pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-red-600 text-white hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo para mover agente para outra pasta */}
      <Dialog open={isMovingDialogOpen} onOpenChange={setIsMovingDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Mover Agente</DialogTitle>
            <DialogDescription className="text-gray-400">
              Escolha uma pasta para mover o agente "{agentToMove?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <button
                className="w-full text-left px-4 py-3 rounded-md flex items-center bg-[#222] border border-[#444] hover:bg-[#333] hover:border-[#00ff9d]/50 transition-colors"
                onClick={() => handleMoveAgent(null)}
              >
                <Home className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Remover da pasta</div>
                  <p className="text-sm text-gray-400">O agente será visível em "Todos os agentes"</p>
                </div>
              </button>
              
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  className="w-full text-left px-4 py-3 rounded-md flex items-center bg-[#222] border border-[#444] hover:bg-[#333] hover:border-[#00ff9d]/50 transition-colors"
                  onClick={() => handleMoveAgent(folder.id)}
                >
                  <Folder className="h-5 w-5 mr-3 text-[#00ff9d]" />
                  <div>
                    <div className="font-medium">{folder.name}</div>
                    {folder.description && (
                      <p className="text-sm text-gray-400 truncate">{folder.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMovingDialogOpen(false)}
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar chaves de API */}
      <Dialog open={isApiKeysDialogOpen} onOpenChange={setIsApiKeysDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Gerenciar Chaves de API</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione e gerencie chaves de API para uso nos seus agentes
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-1">
            {isAddingApiKey ? (
              <div className="space-y-4 p-4 bg-[#222] rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">
                    {isEditingApiKey ? "Editar Chave" : "Nova Chave"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingApiKey(false)
                      setIsEditingApiKey(false)
                      setCurrentApiKey({})
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-gray-300">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={currentApiKey.name || ""}
                      onChange={(e) => setCurrentApiKey({ ...currentApiKey, name: e.target.value })}
                      className="col-span-3 bg-[#333] border-[#444] text-white"
                      placeholder="OpenAI GPT-4"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="provider" className="text-right text-gray-300">
                      Provedor
                    </Label>
                    <Select
                      value={currentApiKey.provider}
                      onValueChange={(value) => setCurrentApiKey({ ...currentApiKey, provider: value })}
                    >
                      <SelectTrigger className="col-span-3 bg-[#333] border-[#444] text-white">
                        <SelectValue placeholder="Selecione o provedor" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222] border-[#444] text-white">
                        <SelectItem
                          value="openai"
                          className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                        >
                          OpenAI
                        </SelectItem>
                        <SelectItem
                          value="anthropic"
                          className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                        >
                          Anthropic
                        </SelectItem>
                        <SelectItem
                          value="cohere"
                          className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                        >
                          Cohere
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key_value" className="text-right text-gray-300">
                      Valor da Chave
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="key_value"
                        value={currentApiKey.key_value || ""}
                        onChange={(e) => setCurrentApiKey({ ...currentApiKey, key_value: e.target.value })}
                        className="bg-[#333] border-[#444] text-white pr-10"
                        type="password"
                        placeholder={isEditingApiKey ? "Deixe em branco para manter o valor atual" : "sk-..."} 
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
                        onClick={() => {
                          const input = document.getElementById("key_value") as HTMLInputElement;
                          if (input) {
                            input.type = input.type === "password" ? "text" : "password";
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditingApiKey && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right text-gray-300">
                        Status
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <Checkbox
                          id="is_active"
                          checked={currentApiKey.is_active !== false}
                          onCheckedChange={(checked) => setCurrentApiKey({ ...currentApiKey, is_active: !!checked })}
                          className="mr-2 data-[state=checked]:bg-[#00ff9d] data-[state=checked]:border-[#00ff9d]"
                        />
                        <Label htmlFor="is_active" className="text-gray-300">
                          Ativa
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingApiKey(false)
                      setIsEditingApiKey(false)
                      setCurrentApiKey({})
                    }}
                    className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveApiKey} className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]">
                    {isEditingApiKey ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Chaves disponíveis</h3>
                  <Button
                    onClick={() => {
                      setIsAddingApiKey(true)
                      setIsEditingApiKey(false)
                      setCurrentApiKey({})
                    }}
                    className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Chave
                  </Button>
                </div>

                {isLoadingApiKeys ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff9d]"></div>
                  </div>
                ) : apiKeys.length > 0 ? (
                  <div className="space-y-2">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between p-3 bg-[#222] rounded-md border border-[#333] hover:border-[#00ff9d]/30"
                      >
                        <div>
                          <p className="font-medium text-white">{apiKey.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                            >
                              {apiKey.provider.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-gray-400">
                              Criada em {new Date(apiKey.created_at).toLocaleDateString()}
                            </p>
                            {!apiKey.is_active && (
                              <Badge variant="outline" className="bg-[#333] text-red-400 border-red-400/30">
                                Inativa
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditApiKey(apiKey)}
                            className="text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setApiKeyToDelete(apiKey)
                              setIsDeleteApiKeyDialogOpen(true)
                            }}
                            className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-[#333] rounded-md bg-[#222] text-gray-400">
                    <Key className="mx-auto h-10 w-10 text-gray-500 mb-3" />
                    <p>Você ainda não tem nenhuma chave de API cadastrada</p>
                    <p className="text-sm mt-1">
                      Adicione suas chaves de API para poder utilizá-las nos seus agentes
                    </p>
                    <Button
                      onClick={() => {
                        setIsAddingApiKey(true)
                        setIsEditingApiKey(false)
                        setCurrentApiKey({})
                      }}
                      className="mt-4 bg-[#333] text-[#00ff9d] hover:bg-[#444]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar chave
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="border-t border-[#333] pt-4">
            <Button
              variant="outline"
              onClick={() => setIsApiKeysDialogOpen(false)}
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão de chave de API */}
      <AlertDialog
        open={isDeleteApiKeyDialogOpen}
        onOpenChange={setIsDeleteApiKeyDialogOpen}
      >
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir a chave "{apiKeyToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para confirmar exclusão de agente */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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
            <AlertDialogAction
              onClick={confirmDeleteAgent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}