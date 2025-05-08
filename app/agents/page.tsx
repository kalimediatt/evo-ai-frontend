"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

import { Agent, AgentCreate } from "@/types/agent";
import { Folder } from "@/services/agentService";
import {
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
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
import { AgentSidebar } from "./AgentSidebar";
import { SearchInput } from "./SearchInput";
import { AgentList } from "./AgentList";
import { EmptyState } from "./EmptyState";
import { AgentForm } from "./forms/AgentForm";
import { FolderDialog } from "./dialogs/FolderDialog";
import { MoveAgentDialog } from "./dialogs/MoveAgentDialog";
import { ConfirmationDialog } from "./dialogs/ConfirmationDialog";
import { ApiKeysDialog } from "./dialogs/ApiKeysDialog";
import { MCPServer } from "@/types/mcpServer";
import { availableModels } from "@/types/aiModels";

export default function AgentsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const clientId = user?.client_id || "";

  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isMovingDialogOpen, setIsMovingDialogOpen] = useState(false);
  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] = useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const [isMCPDialogOpen, setIsMCPDialogOpen] = useState(false);
  const [isCustomMCPDialogOpen, setIsCustomMCPDialogOpen] = useState(false);

  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [agentToMove, setAgentToMove] = useState<Agent | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

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

  useEffect(() => {
    if (!clientId) return;
    loadAgents();
    loadFolders();
    loadApiKeys();
  }, [clientId, selectedFolderId]);

  useEffect(() => {
    const loadMCPs = async () => {
      try {
        const res = await listMCPServers();
        setAvailableMCPs(res.data);
      } catch (error) {
        toast({
          title: "Error loading MCP servers",
          variant: "destructive",
        });
      }
    };

    loadMCPs();
  }, []);

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

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const res = await listFolders(clientId);
      setFolders(res.data);
    } catch (error) {
      toast({ title: "Error loading folders", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      const res = await listApiKeys(clientId);
      setApiKeys(res.data);
    } catch (error) {
      toast({ title: "Error loading API keys", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(lowercaseSearch) ||
          agent.description?.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredAgents(filtered);
    }
  }, [searchTerm, agents]);

  const handleAddAgent = async (agentData: Partial<Agent>) => {
    try {
      setIsLoading(true);
      if (editingAgent) {
        await updateAgent(editingAgent.id, {
          ...agentData,
          client_id: clientId,
        });
        toast({
          title: "Agent updated",
          description: `${agentData.name} was updated successfully`,
        });
      } else {
        const createdAgent = await createAgent({
          ...(agentData as AgentCreate),
          client_id: clientId,
        });

        if (selectedFolderId && createdAgent.data.id) {
          await assignAgentToFolder(
            createdAgent.data.id,
            selectedFolderId,
            clientId
          );
        }

        toast({
          title: "Agent added",
          description: `${agentData.name} was added successfully`,
        });
      }
      loadAgents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    try {
      setIsLoading(true);
      await deleteAgent(agentToDelete.id);
      toast({
        title: "Agent deleted",
        description: "The agent was deleted successfully",
      });
      loadAgents();
      setAgentToDelete(null);
      setIsDeleteAgentDialogOpen(false);
    } catch {
      toast({
        title: "Error",
        description: "Unable to delete agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setNewAgent({ ...agent });
    setIsDialogOpen(true);
  };

  const handleMoveAgent = async (targetFolderId: string | null) => {
    if (!agentToMove) return;
    try {
      setIsLoading(true);
      await assignAgentToFolder(agentToMove.id, targetFolderId, clientId);
      toast({
        title: "Agent moved",
        description: targetFolderId
          ? `Agent moved to folder successfully`
          : "Agent removed from folder successfully",
      });
      setIsMovingDialogOpen(false);
      loadAgents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to move agent",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAgentToMove(null);
    }
  };

  const handleAddFolder = async (folderData: {
    name: string;
    description: string;
  }) => {
    try {
      setIsLoading(true);
      if (editingFolder) {
        await updateFolder(editingFolder.id, folderData, clientId);
        toast({
          title: "Folder updated",
          description: `${folderData.name} was updated successfully`,
        });
      } else {
        await createFolder({
          ...folderData,
          client_id: clientId,
        });
        toast({
          title: "Folder created",
          description: `${folderData.name} was created successfully`,
        });
      }
      loadFolders();
      setIsFolderDialogOpen(false);
      setEditingFolder(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      loadFolders();
      if (selectedFolderId === folderToDelete.id) {
        setSelectedFolderId(null);
      }
      setFolderToDelete(null);
      setIsDeleteFolderDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to delete folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen flex relative">
      <AgentSidebar
        visible={isSidebarVisible}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={() => {
          setEditingFolder(null);
          setIsFolderDialogOpen(true);
        }}
        onEditFolder={(folder) => {
          setEditingFolder(folder as Folder);
          setIsFolderDialogOpen(true);
        }}
        onDeleteFolder={(folder) => {
          setFolderToDelete(folder as Folder);
          setIsDeleteFolderDialogOpen(true);
        }}
        onClose={() => setIsSidebarVisible(!isSidebarVisible)}
      />

      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isSidebarVisible ? "pl-64" : "pl-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center ml-4">
              {selectedFolderId
                ? folders.find((f) => f.id === selectedFolderId)?.name
                : "Agents"}
            </h1>
            {selectedFolderId && (
              <p className="text-sm text-gray-400 mt-1">
                {folders.find((f) => f.id === selectedFolderId)?.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search agents..."
            />

            <Button
              onClick={() => setIsApiKeysDialogOpen(true)}
              className="bg-[#222] text-white hover:bg-[#333] border border-[#444]"
            >
              <Key className="mr-2 h-4 w-4 text-[#00ff9d]" />
              API Keys
            </Button>

            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9d]"></div>
          </div>
        ) : filteredAgents.length > 0 ? (
          <AgentList
            agents={filteredAgents}
            isLoading={isLoading}
            searchTerm={searchTerm}
            selectedFolderId={selectedFolderId}
            availableMCPs={availableMCPs}
            getApiKeyNameById={(id) =>
              apiKeys.find((k) => k.id === id)?.name || null
            }
            getAgentNameById={(id) =>
              agents.find((a) => a.id === id)?.name || id
            }
            onEdit={handleEditAgent}
            onDelete={(agent) => {
              setAgentToDelete(agent);
              setIsDeleteAgentDialogOpen(true);
            }}
            onMove={(agent) => {
              setAgentToMove(agent);
              setIsMovingDialogOpen(true);
            }}
            onClearSearch={() => setSearchTerm("")}
            onCreateAgent={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            apiKeys={apiKeys}
            folders={folders}
          />
        ) : (
          <EmptyState
            type={
              searchTerm
                ? "search-no-results"
                : selectedFolderId
                ? "empty-folder"
                : "no-agents"
            }
            searchTerm={searchTerm}
            onAction={() => {
              searchTerm
                ? setSearchTerm("")
                : (resetForm(), setIsDialogOpen(true));
            }}
            actionLabel={searchTerm ? "Clear search" : "Create Agent"}
          />
        )}
      </div>

      <AgentForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialValues={newAgent}
        apiKeys={apiKeys}
        availableModels={availableModels}
        availableMCPs={availableMCPs}
        agents={agents}
        onOpenApiKeysDialog={() => setIsApiKeysDialogOpen(true)}
        onOpenMCPDialog={() => setIsMCPDialogOpen(true)}
        onOpenCustomMCPDialog={() => setIsCustomMCPDialogOpen(true)}
        onSave={handleAddAgent}
        getAgentNameById={(id) => agents.find((a) => a.id === id)?.name || id}
      />

      <FolderDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        editingFolder={editingFolder}
        onSave={handleAddFolder}
      />

      <MoveAgentDialog
        open={isMovingDialogOpen}
        onOpenChange={setIsMovingDialogOpen}
        agent={agentToMove}
        folders={folders}
        onMove={handleMoveAgent}
      />

      <ConfirmationDialog
        open={isDeleteAgentDialogOpen}
        onOpenChange={setIsDeleteAgentDialogOpen}
        title="Confirm deletion"
        description={`Are you sure you want to delete the agent "${agentToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteAgent}
      />

      <ConfirmationDialog
        open={isDeleteFolderDialogOpen}
        onOpenChange={setIsDeleteFolderDialogOpen}
        title="Confirm deletion"
        description={`Are you sure you want to delete the folder "${folderToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteFolder}
      />

      <ApiKeysDialog
        open={isApiKeysDialogOpen}
        onOpenChange={setIsApiKeysDialogOpen}
        apiKeys={apiKeys}
        isLoading={isLoading}
        onAddApiKey={async (keyData) => {
          await createApiKey({ ...keyData, client_id: clientId });
          loadApiKeys();
        }}
        onUpdateApiKey={async (id, keyData) => {
          await updateApiKey(id, keyData, clientId);
          loadApiKeys();
        }}
        onDeleteApiKey={async (id) => {
          await deleteApiKey(id, clientId);
          loadApiKeys();
        }}
      />
    </div>
  );
}
