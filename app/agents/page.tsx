"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Agent,
  AgentCreate,
  AgentType,
  ToolConfig as AgentToolConfig,
  MCPServerConfig,
  AgentConfig,
  CustomMCPServer,
} from "@/types/agent";
import { MCPServer } from "@/types/mcpServer";
import {
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  Folder as FolderType,
  listFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  assignAgentToFolder,
  ApiKey,
  listApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from "@/services/agentService";
import { listMCPServers } from "@/services/mcpServerService";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AgentsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const clientId = user?.client_id || "";

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [isAddingApiKey, setIsAddingApiKey] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<
    Partial<ApiKey & { key_value?: string }>
  >({});
  const [isDeleteApiKeyDialogOpen, setIsDeleteApiKeyDialogOpen] =
    useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<ApiKey | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [newFolder, setNewFolder] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const [isFolderDeleteDialogOpen, setIsFolderDeleteDialogOpen] =
    useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [agentToMove, setAgentToMove] = useState<Agent | null>(null);
  const [isMovingDialogOpen, setIsMovingDialogOpen] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    loadAgents();
  }, [clientId, selectedFolderId]);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const res = await listAgents(
        clientId,
        0,
        100,
        selectedFolderId || undefined
      );
      setAgents(res.data);
      setFilteredAgents(res.data);
    } catch (error) {
      toast({ title: "Error loading agents", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;
    setIsLoading(true);
    listFolders(clientId)
      .then((res) => setFolders(res.data))
      .catch(() =>
        toast({ title: "Error loading folders", variant: "destructive" })
      )
      .finally(() => setIsLoading(false));
  }, [clientId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(lowercaseSearch) ||
          agent.description?.toLowerCase().includes(lowercaseSearch) ||
          getAgentTypeName(agent.type).toLowerCase().includes(lowercaseSearch)
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  useEffect(() => {
    setIsLoading(true);
    listMCPServers()
      .then((res) => setAvailableMCPs(res.data))
      .catch(() =>
        toast({ title: "Error loading MCP servers", variant: "destructive" })
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!clientId) return;
    loadApiKeys();
  }, [clientId]);

  const loadApiKeys = async () => {
    setIsLoadingApiKeys(true);
    try {
      const res = await listApiKeys(clientId);
      setApiKeys(res.data);
    } catch (error) {
      toast({ title: "Error loading API keys", variant: "destructive" });
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (
      !currentApiKey.name ||
      !currentApiKey.provider ||
      !currentApiKey.key_value
    ) {
      toast({
        title: "Required fields",
        description: "Name, provider and key value are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingApiKeys(true);
      if (currentApiKey.id) {
        // Update existing key
        await updateApiKey(
          currentApiKey.id,
          {
            name: currentApiKey.name,
            provider: currentApiKey.provider,
            key_value: currentApiKey.key_value,
            is_active: currentApiKey.is_active,
          },
          clientId
        );
        toast({
          title: "Key updated",
          description: "The API key was updated successfully",
        });
      } else {
        // Create new key
        await createApiKey({
          name: currentApiKey.name,
          provider: currentApiKey.provider,
          key_value: currentApiKey.key_value,
          client_id: clientId,
        });
        toast({
          title: "Key added",
          description: "The API key was added successfully",
        });
      }

      // Clear form and reload list
      setCurrentApiKey({});
      setIsAddingApiKey(false);
      setIsEditingApiKey(false);
      loadApiKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save the API key",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) return;
    try {
      setIsLoadingApiKeys(true);
      await deleteApiKey(apiKeyToDelete.id, clientId);
      toast({
        title: "Key deleted",
        description: "The API key was deleted successfully",
      });

      // Clear and reload list
      setApiKeyToDelete(null);
      setIsDeleteApiKeyDialogOpen(false);
      loadApiKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete the API key",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  const handleEditApiKey = (apiKey: ApiKey) => {
    setCurrentApiKey({ ...apiKey, key_value: "" });
    setIsEditingApiKey(true);
    setIsAddingApiKey(true);
  };

  const handleAddFolder = async () => {
    if (!newFolder.name) {
      toast({
        title: "Required field",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      if (editingFolder) {
        await updateFolder(editingFolder.id, newFolder, clientId);
        toast({
          title: "Folder updated",
          description: `${newFolder.name} was updated successfully`,
        });
      } else {
        await createFolder({
          ...newFolder,
          client_id: clientId,
        });
        toast({
          title: "Folder created",
          description: `${newFolder.name} was created successfully`,
        });
      }
      // Reload folders
      const res = await listFolders(clientId);
      setFolders(res.data);
      setIsFolderDialogOpen(false);
      resetFolderForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save the folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setNewFolder({
      name: folder.name,
      description: folder.description,
    });
    setIsFolderDialogOpen(true);
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      setIsLoading(true);
      await deleteFolder(folderToDelete.id, clientId);
      toast({
        title: "Folder deleted",
        description: "The folder was deleted successfully",
      });
      // Reload folders
      const res = await listFolders(clientId);
      setFolders(res.data);
      // If the deleted folder was selected, go back to "All agents"
      if (selectedFolderId === folderToDelete.id) {
        setSelectedFolderId(null);
      }
      setFolderToDelete(null);
      setIsFolderDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete the folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFolderForm = () => {
    setNewFolder({
      name: "",
      description: "",
    });
    setEditingFolder(null);
  };

  const handleMoveAgent = async (targetFolderId: string | null) => {
    if (!agentToMove) return;
    try {
      setIsLoading(true);
      await assignAgentToFolder(agentToMove.id, targetFolderId, clientId);
      toast({
        title: "Agent moved",
        description: targetFolderId
          ? `Agent moved to the folder successfully`
          : "Agent removed from the folder successfully",
      });
      setIsMovingDialogOpen(false);
      loadAgents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to move the agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAgentToMove(null);
    }
  };

  const startMoveAgent = (agent: Agent) => {
    setAgentToMove(agent);
    setIsMovingDialogOpen(true);
  };

  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    client_id: clientId || "",
    name: "",
    description: "",
    type: "llm",
    model: "openai/gpt-4.1-nano",
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
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const [activeTab, setActiveTab] = useState("basic");

  const [isMCPDialogOpen, setIsMCPDialogOpen] = useState(false);
  const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null);
  const [mcpEnvs, setMcpEnvs] = useState<Record<string, string>>({});
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);

  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AgentToolConfig | null>(
    null
  );
  const [toolEnvs, setToolEnvs] = useState<Record<string, string>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const [isApiKeyVisible, setIsApiKeyVisible] = useState<boolean>(false);

  const [isCustomMCPDialogOpen, setIsCustomMCPDialogOpen] = useState(false);
  const [selectedCustomMCP, setSelectedCustomMCP] =
    useState<CustomMCPServer | null>(null);
  const [customMCPHeaders, setCustomMCPHeaders] = useState<
    Record<string, string>
  >({});
  const [customMCPHeadersList, setCustomMCPHeadersList] = useState<
    { id: string; key: string; value: string }[]
  >([]);

  const agentTypes = [
    { value: "llm", label: "LLM Agent", icon: Code },
    { value: "a2a", label: "A2A Agent", icon: ExternalLink },
    { value: "sequential", label: "Sequential Agent", icon: Workflow },
    { value: "parallel", label: "Parallel Agent", icon: GitBranch },
    { value: "loop", label: "Loop Agent", icon: RefreshCw },
    { value: "workflow", label: "Workflow Agent", icon: Workflow },
  ];

  const availableModels = [
    // GPT-4.1 series
    { value: "openai/gpt-4.1", label: "GPT-4.1", provider: "openai" },
    { value: "openai/gpt-4.1-nano", label: "GPT-4.1 Nano", provider: "openai" },
    { value: "openai/gpt-4.1-mini", label: "GPT-4.1 Mini", provider: "openai" },

    // GPT-4.5 Preview
    { value: "openai/gpt-4.5-preview", label: "GPT-4.5 Preview", provider: "openai" },

    // GPT-4 Turbo & GPT-4o
    { value: "openai/gpt-4", label: "GPT-4 Turbo", provider: "openai" },
    { value: "openai/gpt-4o", label: "GPT-4o", provider: "openai" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },

    // GPT-4 Legacy
    { value: "openai/gpt-4-32k", label: "GPT-4 32K", provider: "openai" },

    // GPT-3.5 Turbo series
    { value: "openai/gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "openai" },
    {
      value: "openai/gpt-3.5-turbo-16k",
      label: "GPT-3.5 Turbo 16K",
      provider: "openai",
    },

    // Gemini Preview models
    {
      value: "gemini/gemini-2.5-pro-preview-05-06",
      label: "Gemini 2.5 Pro (Preview)",
      provider: "gemini",
    },
    {
      value: "gemini/gemini-2.5-flash-preview-04-17",
      label: "Gemini 2.5 Flash (Preview)",
      provider: "gemini",
    },

    // Gemini GA models
    {
      value: "gemini/gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      provider: "gemini",
    },
    {
      value: "gemini/gemini-2.0-flash-lite",
      label: "Gemini 2.0 Flash-Lite",
      provider: "gemini",
    },
    {
      value: "gemini/gemini-2.0-flash-live-001",
      label: "Gemini 2.0 Flash Live",
      provider: "gemini",
    },

    // Gemini Legacy models
    { value: "gemini/gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "gemini" },
    {
      value: "gemini/gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
      provider: "gemini",
    },
    {
      value: "gemini/gemini-1.5-flash-8b",
      label: "Gemini 1.5 Flash-8B",
      provider: "gemini",
    },

    // Claude 3.7 models
    {
      value: "anthropic/claude-3-7-sonnet-20250219",
      label: "Claude 3.7 Sonnet",
      provider: "anthropic",
    },

    // Claude 3.5 models
    {
      value: "anthropic/claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet v2",
      provider: "anthropic",
    },
    {
      value: "anthropic/claude-3-5-sonnet-20240620",
      label: "Claude 3.5 Sonnet",
      provider: "anthropic",
    },
    {
      value: "anthropic/claude-3-5-haiku-20241022",
      label: "Claude 3.5 Haiku",
      provider: "anthropic",
    },

    // Claude 3 models
    {
      value: "anthropic/claude-3-opus-20240229",
      label: "Claude 3 Opus",
      provider: "anthropic",
    },
    {
      value: "anthropic/claude-3-sonnet-20240229",
      label: "Claude 3 Sonnet",
      provider: "anthropic",
    },
    {
      value: "anthropic/claude-3-haiku-20240307",
      label: "Claude 3 Haiku",
      provider: "anthropic",
    },
  ];

  // Effect to update the form based on the agent type
  useEffect(() => {
    if (newAgent.type === "llm") {
      setNewAgent((prev) => ({
        ...prev,
        model: prev.model || "openai/gpt-4.1-nano",
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
        },
      }));
    } else if (newAgent.type === "a2a") {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: prev.agent_card_url || "",
        api_key_id: undefined,
        config: undefined,
      }));
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
        },
      }));
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
        },
      }));
    } else {
      setNewAgent((prev) => ({
        ...prev,
        model: undefined,
        instruction: undefined,
        agent_card_url: undefined,
        api_key_id: undefined,
        config: {
          sub_agents: [],
          custom_mcp_servers: [],
        },
      }));
    }
  }, [newAgent.type]);

  // Effect to update model when API key changes
  useEffect(() => {
    if (newAgent.type === "llm" && newAgent.api_key_id) {
      const selectedKey = apiKeys.find((key) => key.id === newAgent.api_key_id);

      if (selectedKey) {
        const currentModelProvider = availableModels.find(
          (model) => model.value === newAgent.model
        )?.provider;

        if (currentModelProvider !== selectedKey.provider) {
          const firstCompatibleModel = availableModels.find(
            (model) => model.provider === selectedKey.provider
          );

          if (firstCompatibleModel) {
            setNewAgent((prev) => ({
              ...prev,
              model: firstCompatibleModel.value,
            }));

            toast({
              title: "Model changed",
              description: `Model changed to ${
                firstCompatibleModel.label
              } for compatibility with the ${selectedKey.provider.toUpperCase()} provider`,
            });
          }
        }
      }
    }
  }, [newAgent.api_key_id, apiKeys, newAgent.type]);

  const handleAddAgent = async () => {
    if (!newAgent.name) {
      toast({
        title: "Required field",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if it's an LLM agent and if an API Key is required
    if (newAgent.type === "llm" && !newAgent.api_key_id) {
      toast({
        title: "API Key required",
        description: "Select an API Key for the agent",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove the api_key field if it's present
      const agentData = { ...newAgent };

      setIsLoading(true);
      if (editingAgent) {
        await updateAgent(editingAgent.id, {
          ...agentData,
          client_id: clientId,
        });
        toast({
          title: "Agent updated",
          description: `${newAgent.name} was updated successfully`,
        });
      } else {
        const createdAgent = await createAgent({
          ...(agentData as AgentCreate),
          client_id: clientId,
        });

        // If there's a selected folder, add the agent to it
        if (selectedFolderId && createdAgent.data.id) {
          await assignAgentToFolder(
            createdAgent.data.id,
            selectedFolderId,
            clientId
          );
        }

        toast({
          title: "Agent added",
          description: `${newAgent.name} was added successfully`,
        });
      }
      // Reload list
      loadAgents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving agent:", error);
      toast({
        title: "Error",
        description: "Unable to save the agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete agent
  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      setIsLoading(true);
      await deleteAgent(agentToDelete.id);
      toast({
        title: "Agent deleted",
        description: "The agent was deleted successfully",
      });
      // Reload list
      loadAgents();
      setAgentToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Unable to delete the agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit agent
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setNewAgent({ ...agent });
    setActiveTab("basic");
    setIsDialogOpen(true);
  };

  // Reset the form
  const resetForm = () => {
    setNewAgent({
      client_id: clientId || "",
      name: "",
      description: "",
      type: "llm",
      model: "openai/gpt-4.1-nano",
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
      },
    });
    setEditingAgent(null);
    setActiveTab("basic");
  };

  // Function to add a sub-agent
  const handleAddSubAgent = (agentId: string) => {
    if (!newAgent.config?.sub_agents?.includes(agentId)) {
      setNewAgent({
        ...newAgent,
        config: {
          ...newAgent.config,
          sub_agents: [...(newAgent.config?.sub_agents || []), agentId],
        },
      });
    }
  };

  // Function to remove a sub-agent
  const handleRemoveSubAgent = (agentId: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        sub_agents:
          newAgent.config?.sub_agents?.filter((id) => id !== agentId) || [],
      },
    });
  };

  // Function to open the MCP dialog
  const handleOpenMCPDialog = (mcp?: any) => {
    if (mcp) {
      // If it's an existing MCP configuration (contains only ID, envs and tools)
      if (!mcp.name) {
        // Search for the full MCP in the available list
        const fullMCP = availableMCPs.find((m) => m.id === mcp.id);
        if (fullMCP) {
          setSelectedMCP(fullMCP);
          setMcpEnvs(mcp.envs || {});
          setSelectedMCPTools(mcp.tools || []);
        } else {
          toast({
            title: "Error",
            description: "MCP not found in the available list",
            variant: "destructive",
          });
          return;
        }
      } else {
        // It's a full MCP from the list
        setSelectedMCP(mcp);
        setMcpEnvs(mcp.envs || {});
        setSelectedMCPTools(mcp.selected_tools || []);
      }
    } else {
      // Default value for a new MCP
      setSelectedMCP(null);
      setMcpEnvs({});
      setSelectedMCPTools([]);
    }
    setIsMCPDialogOpen(true);
  };

  // Function to add or update a MCP
  const handleAddMCP = () => {
    if (!selectedMCP) {
      toast({
        title: "Error",
        description: "No MCP selected",
        variant: "destructive",
      });
      return;
    }

    // Check if the config exists before adding MCPs
    if (newAgent.config) {
      const mcp = { ...selectedMCP };

      // Create a MCPServerConfig
      const mcpConfig: MCPServerConfig = {
        id: mcp.id,
        envs: mcpEnvs,
        tools: selectedMCPTools,
      };

      const existingMCPIndex = newAgent.config.mcp_servers?.findIndex(
        (mcpItem) => mcpItem.id === selectedMCP.id
      );

      if (existingMCPIndex !== undefined && existingMCPIndex >= 0) {
        // Update existing MCP
        const updatedMCPs = [...(newAgent.config.mcp_servers || [])];
        updatedMCPs[existingMCPIndex] = mcpConfig;

        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            mcp_servers: updatedMCPs,
          },
        });
      } else {
        // Add new MCP
        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            mcp_servers: [...(newAgent.config.mcp_servers || []), mcpConfig],
          },
        });
      }

      setIsMCPDialogOpen(false);
      toast({
        title: "MCP configured",
        description: `${mcp.name} was configured successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "The current agent type does not support MCP servers",
        variant: "destructive",
      });
    }
  };

  // Function to remove a MCP
  const handleRemoveMCP = (mcpId: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        mcp_servers:
          newAgent.config?.mcp_servers?.filter((mcp) => mcp.id !== mcpId) || [],
      },
    });
    toast({
      title: "MCP removed",
      description: "The MCP was removed successfully",
    });
  };

  // Function to open the tool dialog
  const handleOpenToolDialog = (tool?: AgentToolConfig) => {
    if (tool) {
      setSelectedTool(tool);
      setToolEnvs(tool.envs || {});
    } else {
      setSelectedTool(null);
      setToolEnvs({});
    }
    setIsToolDialogOpen(true);
  };

  // Function to get the agent type icon
  const getAgentTypeIcon = (type: AgentType) => {
    const agentType = agentTypes.find((t) => t.value === type);
    if (agentType) {
      const IconComponent = agentType.icon;
      return <IconComponent className="h-5 w-5" />;
    }
    return null;
  };

  // Function to get the agent type name
  const getAgentTypeName = (type: AgentType) => {
    return agentTypes.find((t) => t.value === type)?.label || type;
  };

  // Function to get the agent name by ID
  const getAgentNameById = (id: string) => {
    const agent = agents.find((a) => a.id === id);
    return agent ? agent.name : id;
  };

  // Function to toggle the selection of a MCP tool
  const toggleMCPTool = (tool: any) => {
    if (selectedMCPTools.includes(tool)) {
      setSelectedMCPTools(selectedMCPTools.filter((t) => t !== tool));
    } else {
      setSelectedMCPTools([...selectedMCPTools, tool]);
    }
  };

  // Function to copy text to the clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Value copied to the clipboard",
        });
      })
      .catch((err) => {
        console.error("Error copying: ", err);
        toast({
          title: "Error copying",
          description: "Unable to copy the value",
          variant: "destructive",
        });
      });
  };

  // Function to open the custom MCP dialog
  const handleOpenCustomMCPDialog = (customMCP?: CustomMCPServer) => {
    if (customMCP) {
      setSelectedCustomMCP(customMCP);
      // Convert the headers object to an array of {id, key, value}
      const headersList = Object.entries(customMCP.headers || {}).map(
        ([key, value], index) => ({
          id: `header-${index}`,
          key,
          value,
        })
      );
      setCustomMCPHeadersList(headersList);
    } else {
      setSelectedCustomMCP(null);
      setCustomMCPHeadersList([]);
    }
    setIsCustomMCPDialogOpen(true);
  };

  // Function to add/update a custom MCP
  const handleAddCustomMCP = () => {
    if (!selectedCustomMCP?.url) {
      toast({
        title: "Error",
        description: "The custom MCP URL is required",
        variant: "destructive",
      });
      return;
    }

    // Check if the config exists before adding MCPs
    if (newAgent.config) {
      // Convert the headers list back to an object Record
      const headersObject: Record<string, string> = {};
      customMCPHeadersList.forEach((header) => {
        if (header.key.trim()) {
          headersObject[header.key] = header.value;
        }
      });

      const customMCPConfig: CustomMCPServer = {
        url: selectedCustomMCP.url,
        headers: headersObject,
      };

      const existingCustomMCPIndex =
        newAgent.config.custom_mcp_servers?.findIndex(
          (customMCP) => customMCP.url === selectedCustomMCP.url
        );

      if (existingCustomMCPIndex !== undefined && existingCustomMCPIndex >= 0) {
        // Update existing custom MCP
        const updatedCustomMCPs = [
          ...(newAgent.config.custom_mcp_servers || []),
        ];
        updatedCustomMCPs[existingCustomMCPIndex] = customMCPConfig;

        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            custom_mcp_servers: updatedCustomMCPs,
          },
        });
      } else {
        // Add new custom MCP
        setNewAgent({
          ...newAgent,
          config: {
            ...newAgent.config,
            custom_mcp_servers: [
              ...(newAgent.config.custom_mcp_servers || []),
              customMCPConfig,
            ],
          },
        });
      }

      setIsCustomMCPDialogOpen(false);
      toast({
        title: "Custom MCP configured",
        description: `MCP ${selectedCustomMCP.url} was configured successfully`,
      });
    } else {
      toast({
        title: "Error",
        description:
          "The current agent type does not support custom MCP servers",
        variant: "destructive",
      });
    }
  };

  // Function to remove a custom MCP
  const handleRemoveCustomMCP = (url: string) => {
    setNewAgent({
      ...newAgent,
      config: {
        ...newAgent.config,
        custom_mcp_servers:
          newAgent.config?.custom_mcp_servers?.filter(
            (customMCP) => customMCP.url !== url
          ) || [],
      },
    });
    toast({
      title: "Custom MCP removed",
      description: "The custom MCP was removed successfully",
    });
  };

  // Function to get the folder name by ID
  const getFolderNameById = (id: string | null) => {
    if (!id) return null;
    const folder = folders.find((f) => f.id === id);
    return folder ? folder.name : null;
  };

  // Function to get the API key name by ID
  const getApiKeyNameById = (id: string | undefined) => {
    if (!id) return null;
    const apiKey = apiKeys.find((key) => key.id === id);
    return apiKey ? apiKey.name : null;
  };

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen flex relative">
      {/* Button to show/hide the sidebar */}
      <button
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        className={`absolute left-0 top-6 z-20 bg-[#222] p-2 rounded-r-md text-[#00ff9d] hover:bg-[#333] hover:text-[#00ff9d] shadow-md transition-all ${
          isSidebarVisible ? "left-64" : "left-0"
        }`}
        aria-label={isSidebarVisible ? "Hide folders" : "Show folders"}
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

      {/* Dark overlay when the sidebar is visible */}
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      {/* Sidebar for folders with animation */}
      <div
        className={`absolute top-0 left-0 h-full w-64 bg-[#1a1a1a] p-4 shadow-xl z-20 transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Folder className="h-5 w-5 mr-2 text-[#00ff9d]" />
            Folders
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#00ff9d] hover:bg-[#222]"
              onClick={() => {
                resetFolderForm();
                setIsFolderDialogOpen(true);
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
            <span>All agents</span>
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
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#222] border-[#333] text-white"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFolder(folder);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder);
                        setIsFolderDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "pl-64" : "pl-0"
        }`}
      >
        {/* Page title and search bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center ml-4">
              {selectedFolderId ? (
                <>
                  <Folder className="h-6 w-6 mr-2 text-[#00ff9d]" />
                  {getFolderNameById(selectedFolderId)}
                </>
              ) : (
                "Agents"
              )}
            </h1>
            {selectedFolderId && (
              <p className="text-sm text-gray-400 mt-1">
                {folders.find((f) => f.id === selectedFolderId)?.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agents..."
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
              API Keys
            </Button>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                  }}
                  className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingAgent ? "Edit Agent" : "New Agent"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {editingAgent
                      ? "Edit the existing agent information"
                      : "Fill in the information to create a new agent"}
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 overflow-hidden flex flex-col"
                >
                  <TabsList className="grid grid-cols-3 bg-[#222]">
                    <TabsTrigger
                      value="basic"
                      className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                    >
                      Basic Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="config"
                      className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                    >
                      Configuration
                    </TabsTrigger>
                    <TabsTrigger
                      value="subagents"
                      className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                    >
                      Sub-Agents
                    </TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1 overflow-auto">
                    <TabsContent value="basic" className="p-4 space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="type"
                          className="text-right text-gray-300"
                        >
                          Agent Type
                        </Label>
                        <Select
                          value={newAgent.type}
                          onValueChange={(value: AgentType) =>
                            setNewAgent({
                              ...newAgent,
                              type: value,
                            } as Partial<Agent> & { type?: string })
                          }
                        >
                          <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                            <SelectValue placeholder="Select the type" />
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
                        <Label
                          htmlFor="name"
                          className="text-right text-gray-300"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newAgent.name || ""}
                          onChange={(e) =>
                            setNewAgent({
                              ...newAgent,
                              name: e.target.value,
                            } as Partial<Agent> & { name?: string })
                          }
                          className="col-span-3 bg-[#222] border-[#444] text-white"
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="description"
                          className="text-right text-gray-300"
                        >
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newAgent.description || ""}
                          onChange={(e) =>
                            setNewAgent({
                              ...newAgent,
                              description: e.target.value,
                            } as Partial<Agent> & { description?: string })
                          }
                          className="col-span-3 bg-[#222] border-[#444] text-white"
                        />
                      </div>

                      {newAgent.type === "llm" && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="api_key"
                              className="text-right text-gray-300"
                            >
                              API Key
                            </Label>
                            <div className="col-span-3 space-y-4">
                              <div className="flex items-center">
                                <Select
                                  value={newAgent.api_key_id || ""}
                                  onValueChange={(value) =>
                                    setNewAgent({
                                      ...newAgent,
                                      api_key_id: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="flex-1 bg-[#222] border-[#444] text-white">
                                    <SelectValue placeholder="Select an API key" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#222] border-[#444] text-white">
                                    {apiKeys.length > 0 ? (
                                      apiKeys
                                        .filter(
                                          (key) => key.is_active !== false
                                        )
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
                                        No API keys available
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
                                    You need to{" "}
                                    <Button
                                      variant="link"
                                      onClick={() =>
                                        setIsApiKeysDialogOpen(true)
                                      }
                                      className="h-auto p-0 text-xs text-[#00ff9d]"
                                    >
                                      register API keys
                                    </Button>{" "}
                                    before creating an agent.
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="model"
                              className="text-right text-gray-300"
                            >
                              Model
                            </Label>
                            <Select
                              value={newAgent.model}
                              onValueChange={(value) =>
                                setNewAgent({
                                  ...newAgent,
                                  model: value,
                                } as Partial<Agent> & { model?: string })
                              }
                            >
                              <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
                                <SelectValue placeholder="Select the model" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#222] border-[#444] text-white">
                                {availableModels
                                  .filter((model) => {
                                    if (!newAgent.api_key_id) return true;

                                    const selectedKey = apiKeys.find(
                                      (key) => key.id === newAgent.api_key_id
                                    );

                                    if (!selectedKey) return true;

                                    return (
                                      model.provider === selectedKey.provider
                                    );
                                  })
                                  .map((model) => (
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
                            <Label
                              htmlFor="instruction"
                              className="text-right text-gray-300"
                            >
                              Instructions
                            </Label>
                            <Textarea
                              id="instruction"
                              value={newAgent.instruction || ""}
                              onChange={(e) =>
                                setNewAgent({
                                  ...newAgent,
                                  instruction: e.target.value,
                                } as Partial<Agent> & { instruction?: string })
                              }
                              className="col-span-3 bg-[#222] border-[#444] text-white"
                              rows={4}
                            />
                          </div>
                        </>
                      )}

                      {newAgent.type === "a2a" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="agent_card_url"
                            className="text-right text-gray-300"
                          >
                            Agent Card URL
                          </Label>
                          <Input
                            id="agent_card_url"
                            value={newAgent.agent_card_url || ""}
                            onChange={(e) =>
                              setNewAgent({
                                ...newAgent,
                                agent_card_url: e.target.value,
                              } as Partial<Agent> & { agent_card_url?: string })
                            }
                            className="col-span-3 bg-[#222] border-[#444] text-white"
                          />
                        </div>
                      )}

                      {newAgent.type === "loop" &&
                        newAgent.config?.max_iterations && (
                          <div className="space-y-1 text-xs text-gray-400">
                            <div>
                              <strong>Max. Iterations:</strong>{" "}
                              {newAgent.config.max_iterations}
                            </div>
                          </div>
                        )}

                      {newAgent.type === "workflow" && (
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>
                            <strong>Type:</strong> Visual Flow
                          </div>
                          {newAgent.config?.workflow && (
                            <div>
                              <strong>Elements:</strong>{" "}
                              {newAgent.config.workflow.nodes?.length || 0}{" "}
                              nodes,{" "}
                              {newAgent.config.workflow.edges?.length || 0}{" "}
                              connections
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="config" className="p-4 space-y-4">
                      {newAgent.type === "llm" && (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">
                              MCP Servers
                            </h3>
                            <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                              <p className="text-sm text-gray-400 mb-4">
                                Configure the MCP servers that this agent can
                                use.
                              </p>

                              {newAgent.config?.mcp_servers &&
                              newAgent.config.mcp_servers.length > 0 ? (
                                <div className="space-y-2">
                                  {newAgent.config.mcp_servers.map(
                                    (mcpConfig) => {
                                      // Find the corresponding MCP server to get name and description
                                      const mcpServer = availableMCPs.find(
                                        (mcp) => mcp.id === mcpConfig.id
                                      );
                                      return (
                                        <div
                                          key={mcpConfig.id}
                                          className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                        >
                                          <div>
                                            <p className="font-medium text-white">
                                              {mcpServer?.name || mcpConfig.id}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                              {mcpServer?.description?.substring(
                                                0,
                                                100
                                              )}
                                              ...
                                            </p>
                                            {mcpConfig.tools &&
                                              mcpConfig.tools.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {mcpConfig.tools.map(
                                                    (toolId) => (
                                                      <Badge
                                                        key={toolId}
                                                        variant="outline"
                                                        className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                                                      >
                                                        {toolId}
                                                      </Badge>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleOpenMCPDialog(mcpConfig)
                                              }
                                              className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                            >
                                              <Settings className="h-4 w-4 mr-1" />{" "}
                                              Configure
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleRemoveMCP(mcpConfig.id)
                                              }
                                              className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}

                                  {/* Button to add more MCP servers, always visible */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenMCPDialog()}
                                    className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add MCP
                                    Server
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md mb-2">
                                  <div>
                                    <p className="font-medium text-white">
                                      No MCP servers configured
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Add MCP servers for this agent
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenMCPDialog()}
                                    className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* New section for custom MCPs */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">
                              Custom MCP Servers
                            </h3>
                            <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                              <p className="text-sm text-gray-400 mb-4">
                                Configure custom MCP servers with URL and HTTP
                                headers.
                              </p>

                              {newAgent.config?.custom_mcp_servers &&
                              newAgent.config.custom_mcp_servers.length > 0 ? (
                                <div className="space-y-2">
                                  {newAgent.config.custom_mcp_servers.map(
                                    (customMCP) => (
                                      <div
                                        key={customMCP.url}
                                        className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md"
                                      >
                                        <div>
                                          <p className="font-medium text-white">
                                            {customMCP.url}
                                          </p>
                                          <p className="text-sm text-gray-400">
                                            {Object.keys(
                                              customMCP.headers || {}
                                            ).length > 0
                                              ? `${
                                                  Object.keys(
                                                    customMCP.headers || {}
                                                  ).length
                                                } headers configured`
                                              : "No headers configured"}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleOpenCustomMCPDialog(
                                                customMCP
                                              )
                                            }
                                            className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                                          >
                                            <Settings className="h-4 w-4 mr-1" />{" "}
                                            Configure
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveCustomMCP(
                                                customMCP.url
                                              )
                                            }
                                            className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  )}

                                  {/* Button to add more custom MCPs */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCustomMCPDialog()}
                                    className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Custom
                                    MCP
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded-md mb-2">
                                  <div>
                                    <p className="font-medium text-white">
                                      No custom MCPs configured
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Add custom MCPs for this agent
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCustomMCPDialog()}
                                    className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* API Key Display Section */}
                          {editingAgent &&
                            (editingAgent.config?.api_key || "not defined") && (
                              <div className="mt-6 space-y-2">
                                <h3 className="text-lg font-medium text-white">
                                  Security Information
                                </h3>
                                <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-gray-300 block mb-2">
                                        API Key
                                      </Label>
                                      <div className="flex items-center">
                                        <div className="relative flex-1">
                                          <div className="bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-[#00ff9d] font-mono text-sm relative overflow-hidden">
                                            {isApiKeyVisible
                                              ? editingAgent.config?.api_key ||
                                                "not defined"
                                              : "•".repeat(
                                                  Math.min(
                                                    16,
                                                    (
                                                      editingAgent.config
                                                        ?.api_key ||
                                                      "not defined" ||
                                                      ""
                                                    ).length
                                                  )
                                                )}
                                          </div>
                                        </div>
                                        <div className="flex ml-2 space-x-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-[#333] text-white hover:bg-[#444] hover:text-[#00ff9d]"
                                            onClick={() =>
                                              setIsApiKeyVisible(
                                                !isApiKeyVisible
                                              )
                                            }
                                            title={
                                              isApiKeyVisible
                                                ? "Hide API Key"
                                                : "Show API Key"
                                            }
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
                                            onClick={() =>
                                              copyToClipboard(
                                                editingAgent.config?.api_key ||
                                                  "not defined" ||
                                                  ""
                                              )
                                            }
                                            title="Copy API Key"
                                          >
                                            <Copy className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-400 mt-2">
                                        This is the API key of your agent. Keep
                                        it secure and do not share it with third
                                        parties.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                        </>
                      )}

                      {(newAgent.type === "sequential" ||
                        newAgent.type === "parallel" ||
                        newAgent.type === "loop" ||
                        newAgent.type === "workflow") && (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-center">
                            <p className="text-gray-400">
                              Configure the sub-agents in the "Sub-Agents" tab
                            </p>
                          </div>
                        </div>
                      )}

                      {newAgent.type === "a2a" && (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-center">
                            <p className="text-gray-400">
                              A2A agents are configured through the Agent Card
                              URL
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Sub-agents can be configured in the "Sub-Agents"
                              tab
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="subagents" className="p-4 space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-white">
                            Sub-Agents
                          </h3>
                          <div className="text-sm text-gray-400">
                            {newAgent.config?.sub_agents?.length || 0} selected
                            sub-agents
                          </div>
                        </div>

                        <div className="border border-[#444] rounded-md p-4 bg-[#222]">
                          <p className="text-sm text-gray-400 mb-4">
                            Select the agents that will be used as sub-agents.
                          </p>

                          {/* List of selected sub-agents */}
                          {newAgent.config?.sub_agents &&
                          newAgent.config.sub_agents.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              <h4 className="text-sm font-medium text-white">
                                Selected sub-agents:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {newAgent.config.sub_agents.map((agentId) => (
                                  <Badge
                                    key={agentId}
                                    variant="secondary"
                                    className="flex items-center gap-1 bg-[#333] text-[#00ff9d]"
                                  >
                                    {getAgentNameById(agentId)}
                                    <button
                                      onClick={() =>
                                        handleRemoveSubAgent(agentId)
                                      }
                                      className="ml-1 h-4 w-4 rounded-full hover:bg-[#444] inline-flex items-center justify-center"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-400 mb-4">
                              No sub-agents selected
                            </div>
                          )}

                          {/* List of available agents */}
                          <h4 className="text-sm font-medium text-white mb-2">
                            Available agents:
                          </h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {agents
                              .filter((agent) => agent.id !== editingAgent?.id) // Do not show the agent being edited
                              .map((agent) => (
                                <div
                                  key={agent.id}
                                  className="flex items-center justify-between p-2 hover:bg-[#2a2a2a] rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">
                                      {agent.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="ml-2 border-[#444] text-[#00ff9d]"
                                    >
                                      {getAgentTypeName(agent.type)}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddSubAgent(agent.id)}
                                    disabled={newAgent.config?.sub_agents?.includes(
                                      agent.id
                                    )}
                                    className={
                                      newAgent.config?.sub_agents?.includes(
                                        agent.id
                                      )
                                        ? "text-gray-500 bg-[#222] hover:bg-[#333]"
                                        : "text-[#00ff9d] hover:bg-[#333] bg-[#222]"
                                    }
                                  >
                                    {newAgent.config?.sub_agents?.includes(
                                      agent.id
                                    )
                                      ? "Added"
                                      : "Add"}
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
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAgent}
                    className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                  >
                    {editingAgent ? "Save Changes" : "Add Agent"}
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
                      <Badge className="mt-1 bg-[#333] text-[#00ff9d] border-none">
                        {getAgentTypeName(agent.type)}
                      </Badge>
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
                          onClick={() =>
                            router.push(`/agents/workflows?agentId=${agent.id}`)
                          }
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
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#222] border-[#333] text-white"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
                            onClick={() => startMoveAgent(agent)}
                          >
                            <MoveRight className="h-4 w-4 mr-2" />
                            Move to Folder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                            onClick={() => {
                              setAgentToDelete(agent);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-300 mb-3">
                    {agent.description?.substring(0, 100)}...
                  </p>

                  {agent.type === "llm" && (
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>
                        <strong>Model:</strong> {agent.model}
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
                          <strong>Instructions:</strong>{" "}
                          {agent.instruction.length > 60
                            ? `${agent.instruction.substring(0, 60)}...`
                            : agent.instruction}
                        </div>
                      )}
                    </div>
                  )}

                  {agent.type === "a2a" && (
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>
                        <strong>Agent Card URL:</strong>{" "}
                        <span className="truncate block">
                          {agent.agent_card_url}
                        </span>
                      </div>
                    </div>
                  )}

                  {agent.type === "loop" && agent.config?.max_iterations && (
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>
                        <strong>Max. Iterations:</strong>{" "}
                        {agent.config.max_iterations}
                      </div>
                    </div>
                  )}

                  {agent.type === "workflow" && (
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>
                        <strong>Type:</strong> Visual Workflow
                      </div>
                      {agent.config?.workflow && (
                        <div>
                          <strong>Elements:</strong>{" "}
                          {agent.config.workflow.nodes?.length || 0} nodes,{" "}
                          {agent.config.workflow.edges?.length || 0} connections
                        </div>
                      )}
                    </div>
                  )}

                  {agent.config?.sub_agents &&
                    agent.config.sub_agents.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-300 mb-1">
                          Sub-agents:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.config.sub_agents.map((subAgentId) => (
                            <Badge
                              key={subAgentId}
                              variant="outline"
                              className="text-xs border-[#444] text-[#00ff9d]"
                            >
                              {getAgentNameById(subAgentId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {agent.type === "llm" &&
                    agent.config?.mcp_servers &&
                    agent.config.mcp_servers.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-300 mb-1">
                          MCP Servers:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.config.mcp_servers.map((mcpConfig) => {
                            // Find the corresponding MCP server to get the name
                            const mcpServer = availableMCPs.find(
                              (mcp) => mcp.id === mcpConfig.id
                            );
                            // Count tools from this MCP
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

                        {/* Total of tools in all MCPs */}
                        {agent.config.mcp_servers.some(
                          (mcp) => mcp.tools && mcp.tools.length > 0
                        ) && (
                          <div className="mt-1 text-xs text-gray-400">
                            <strong>Total of Tools:</strong>{" "}
                            {agent.config.mcp_servers.reduce(
                              (total, mcp) => total + (mcp.tools?.length || 0),
                              0
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  {agent.type === "llm" &&
                    agent.config?.custom_mcp_servers &&
                    agent.config.custom_mcp_servers.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-300 mb-1">
                          Custom MCPs:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {agent.config.custom_mcp_servers.map((customMCP) => (
                            <Badge
                              key={customMCP.url}
                              variant="outline"
                              className="text-xs border-[#444] text-white bg-[#333]"
                            >
                              <span className="flex items-center gap-1">
                                <Server className="h-3 w-3 text-[#00ff9d]" />
                                {customMCP.url.split("//")[1]?.split("/")[0] ||
                                  customMCP.url}
                                {Object.keys(customMCP.headers || {}).length >
                                  0 && (
                                  <span className="ml-1 bg-[#00ff9d] text-black text-[9px] px-1 rounded-full">
                                    {
                                      Object.keys(customMCP.headers || {})
                                        .length
                                    }
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
                    <strong>Created at:</strong>{" "}
                    {new Date(agent.created_at).toLocaleString()}
                  </div>
                  {agent.agent_card_url && (
                    <a
                      href={agent.agent_card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 bg-[#333] text-[#00ff9d] hover:bg-[#444] px-2 py-1 rounded-md transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Agent Card
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
            <h2 className="text-2xl font-semibold text-white mb-3">
              No agents found
            </h2>
            <p className="text-gray-300 mb-6 max-w-md">
              We couldn't find any agents that match your search: "{searchTerm}"
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-[#222] text-white hover:bg-[#333]"
            >
              Clear search
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
              {selectedFolderId ? "Empty folder" : "No agents found"}
            </h2>
            <p className="text-gray-300 mb-6 max-w-md">
              {selectedFolderId
                ? "This folder is empty. Add agents or create a new one."
                : "You don't have any agents configured. Create your first agent to start!"}
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] px-6 py-2 hover:shadow-[0_0_15px_rgba(0,255,157,0.2)]"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Agent
            </Button>
          </div>
        )}
      </div>

      {/* Dialog to create/edit folders */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? "Edit Folder" : "New Folder"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingFolder
                ? "Update the existing folder information"
                : "Fill in the information to create a new folder"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-gray-300">
                Folder Name
              </Label>
              <Input
                id="folder-name"
                value={newFolder.name}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, name: e.target.value })
                }
                className="bg-[#222] border-[#444] text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder-description" className="text-gray-300">
                Description (optional)
              </Label>
              <Textarea
                id="folder-description"
                value={newFolder.description}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, description: e.target.value })
                }
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
              Cancel
            </Button>
            <Button
              onClick={handleAddFolder}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            >
              {editingFolder ? "Save Changes" : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog to confirm folder deletion */}
      <AlertDialog
        open={isFolderDeleteDialogOpen}
        onOpenChange={setIsFolderDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the folder "{folderToDelete?.name}
              "? The agents will not be deleted, only removed from the folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog to move agent to another folder */}
      <Dialog open={isMovingDialogOpen} onOpenChange={setIsMovingDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle>Move Agent</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a folder to move the agent "{agentToMove?.name}"
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
                  <div className="font-medium">Remove from folder</div>
                  <p className="text-sm text-gray-400">
                    The agent will be visible in "All agents"
                  </p>
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
                      <p className="text-sm text-gray-400 truncate">
                        {folder.description}
                      </p>
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
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog to manage API keys */}
      <Dialog open={isApiKeysDialogOpen} onOpenChange={setIsApiKeysDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-white">Manage API Keys</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add and manage API keys for use in your agents
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-1">
            {isAddingApiKey ? (
              <div className="space-y-4 p-4 bg-[#222] rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">
                    {isEditingApiKey ? "Edit Key" : "New Key"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingApiKey(false);
                      setIsEditingApiKey(false);
                      setCurrentApiKey({});
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-gray-300">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={currentApiKey.name || ""}
                      onChange={(e) =>
                        setCurrentApiKey({
                          ...currentApiKey,
                          name: e.target.value,
                        })
                      }
                      className="col-span-3 bg-[#333] border-[#444] text-white"
                      placeholder="OpenAI GPT-4"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="provider"
                      className="text-right text-gray-300"
                    >
                      Provider
                    </Label>
                    <Select
                      value={currentApiKey.provider}
                      onValueChange={(value) =>
                        setCurrentApiKey({ ...currentApiKey, provider: value })
                      }
                    >
                      <SelectTrigger className="col-span-3 bg-[#333] border-[#444] text-white">
                        <SelectValue placeholder="Select the provider" />
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
                          value="gemini"
                          className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                        >
                          Gemini
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="key_value"
                      className="text-right text-gray-300"
                    >
                      Key Value
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="key_value"
                        value={currentApiKey.key_value || ""}
                        onChange={(e) =>
                          setCurrentApiKey({
                            ...currentApiKey,
                            key_value: e.target.value,
                          })
                        }
                        className="bg-[#333] border-[#444] text-white pr-10"
                        type="password"
                        placeholder={
                          isEditingApiKey
                            ? "Leave blank to keep the current value"
                            : "sk-..."
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-white"
                        onClick={() => {
                          const input = document.getElementById(
                            "key_value"
                          ) as HTMLInputElement;
                          if (input) {
                            input.type =
                              input.type === "password" ? "text" : "password";
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditingApiKey && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="is_active"
                        className="text-right text-gray-300"
                      >
                        Status
                      </Label>
                      <div className="col-span-3 flex items-center">
                        <Checkbox
                          id="is_active"
                          checked={currentApiKey.is_active !== false}
                          onCheckedChange={(checked) =>
                            setCurrentApiKey({
                              ...currentApiKey,
                              is_active: !!checked,
                            })
                          }
                          className="mr-2 data-[state=checked]:bg-[#00ff9d] data-[state=checked]:border-[#00ff9d]"
                        />
                        <Label htmlFor="is_active" className="text-gray-300">
                          Active
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingApiKey(false);
                      setIsEditingApiKey(false);
                      setCurrentApiKey({});
                    }}
                    className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveApiKey}
                    className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                  >
                    {isEditingApiKey ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Available Keys
                  </h3>
                  <Button
                    onClick={() => {
                      setIsAddingApiKey(true);
                      setIsEditingApiKey(false);
                      setCurrentApiKey({});
                    }}
                    className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Key
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
                          <p className="font-medium text-white">
                            {apiKey.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                            >
                              {apiKey.provider.toUpperCase()}
                            </Badge>
                            <p className="text-xs text-gray-400">
                              Created on{" "}
                              {new Date(apiKey.created_at).toLocaleDateString()}
                            </p>
                            {!apiKey.is_active && (
                              <Badge
                                variant="outline"
                                className="bg-[#333] text-red-400 border-red-400/30"
                              >
                                Inactive
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
                              setApiKeyToDelete(apiKey);
                              setIsDeleteApiKeyDialogOpen(true);
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
                    <p>You don't have any API key registered</p>
                    <p className="text-sm mt-1">
                      Add your API keys to be able to use them in your agents
                    </p>
                    <Button
                      onClick={() => {
                        setIsAddingApiKey(true);
                        setIsEditingApiKey(false);
                        setCurrentApiKey({});
                      }}
                      className="mt-4 bg-[#333] text-[#00ff9d] hover:bg-[#444]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add key
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
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog to confirm API key deletion */}
      <AlertDialog
        open={isDeleteApiKeyDialogOpen}
        onOpenChange={setIsDeleteApiKeyDialogOpen}
      >
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the key "{apiKeyToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog to confirm agent deletion */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm delete</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the agent "{agentToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAgent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
