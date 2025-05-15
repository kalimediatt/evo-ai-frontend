/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/workflows/nodes/components/agent/AgentForm.tsx            │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
│ Contact: contato@evolution-api.com                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
└──────────────────────────────────────────────────────────────────────────────┘
*/
/* eslint-disable jsx-a11y/alt-text */
import { useEdges, useNodes } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "@/types/agent";
import { listAgents, listFolders, Folder, getAgent } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Loader2, Search, FolderIcon, Trash2, Play, MessageSquare, PlayIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AgentForm as GlobalAgentForm } from "@/app/agents/forms/AgentForm";
import { ApiKey, listApiKeys } from "@/services/agentService";
import { listMCPServers } from "@/services/mcpServerService";
import { availableModels } from "@/types/aiModels";
import { MCPServer } from "@/types/mcpServer";
import { AgentTestChatModal } from "./AgentTestChatModal";
import { sanitizeAgentName, escapePromptBraces } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* eslint-disable @typescript-eslint/no-explicit-any */
const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {};
const clientId: string = user?.client_id ? String(user.client_id) : "";

function AgentForm({
  selectedNode,
  handleUpdateNode,
  setEdges,
  setIsOpen,
  setSelectedNode,
}: {
  selectedNode: any;
  handleUpdateNode: any;
  setEdges: any;
  setIsOpen: any;
  setSelectedNode: any;
}) {
  const [node, setNode] = useState(selectedNode);
  const [loading, setLoading] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingCurrentAgent, setLoadingCurrentAgent] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [agentFolderId, setAgentFolderId] = useState<string | null>(null);
  const edges = useEdges();
  const nodes = useNodes();
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableMCPs, setAvailableMCPs] = useState<MCPServer[]>([]);
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
      custom_tools: { http_tools: [] },
      sub_agents: [],
      agent_tools: [],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const connectedNode = useMemo(() => {
    const edge = edges.find((edge: any) => edge.source === selectedNode.id);
    if (!edge) return null;
    const node = nodes.find((node: any) => node.id === edge.target);
    return node || null;
  }, [edges, nodes, selectedNode.id]);
  
  const currentAgent = typeof window !== "undefined" ? 
    JSON.parse(localStorage.getItem("current_workflow_agent") || '{}') : {};
  const currentAgentId = currentAgent?.id;

  useEffect(() => {
    if (selectedNode) {
      setNode(selectedNode);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!clientId) return;
    setLoadingFolders(true);
    listFolders(clientId)
      .then((res) => {
        setFolders(res.data);
      })
      .catch((error) => console.error("Error loading folders:", error))
      .finally(() => setLoadingFolders(false));
  }, [clientId]);

  useEffect(() => {
    if (!currentAgentId || !clientId) {
      return;
    }
    
    setLoadingCurrentAgent(true);
    
    getAgent(currentAgentId, clientId)
      .then((res) => {
        const agent = res.data;
        if (agent.folder_id) {
          setAgentFolderId(agent.folder_id);
          setSelectedFolderId(agent.folder_id);
        }
      })
      .catch((error) => console.error("Error loading current agent:", error))
      .finally(() => setLoadingCurrentAgent(false));
  }, [currentAgentId, clientId]);

  useEffect(() => {
    if (!clientId) return;
    
    if (loadingFolders || loadingCurrentAgent) return;
    
    setLoading(true);
    
    listAgents(clientId, 0, 100, selectedFolderId || undefined)
      .then((res) => {
        const filteredAgents = res.data.filter((agent: Agent) => agent.id !== currentAgentId);
        setAllAgents(filteredAgents);
        setAgents(filteredAgents);
      })
      .catch((error) => console.error("Error loading agents:", error))
      .finally(() => setLoading(false));
  }, [clientId, currentAgentId, selectedFolderId, loadingFolders, loadingCurrentAgent]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setAgents(allAgents);
    } else {
      const filtered = allAgents.filter((agent) => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setAgents(filtered);
    }
  }, [searchTerm, allAgents]);

  useEffect(() => {
    if (!clientId) return;
    listApiKeys(clientId).then((res) => setApiKeys(res.data));
    listMCPServers().then((res) => setAvailableMCPs(res.data));
  }, [clientId]);

  const handleDeleteEdge = useCallback(() => {
    const id = edges.find((edge: any) => edge.source === selectedNode.id)?.id;
    setEdges((edges: any) => {
      const left = edges.filter((edge: any) => edge.id !== id);
      return left;
    });
  }, [nodes, edges, selectedNode, setEdges]);

  const handleSelectAgent = (agent: Agent) => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        agent,
      },
    };
    setNode(updatedNode);
    handleUpdateNode(updatedNode);
  };

  const getAgentTypeName = (type: string) => {
    const agentTypes: Record<string, string> = {
      llm: "LLM Agent",
      a2a: "A2A Agent",
      sequential: "Sequential Agent",
      parallel: "Parallel Agent",
      loop: "Loop Agent",
      workflow: "Workflow Agent",
      task: "Task Agent",
    };
    return agentTypes[type] || type;
  };

  const handleOpenAgentDialog = () => {
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
        custom_tools: { http_tools: [] },
        sub_agents: [],
        agent_tools: [],
      },
      folder_id: selectedFolderId || undefined,
    });
    setIsAgentDialogOpen(true);
  };

  const handleSaveAgent = async (agentData: Partial<Agent>) => {
    setIsLoading(true);
    try {
      const sanitizedData = {
        ...agentData,
        client_id: clientId,
        name: agentData.name ? sanitizeAgentName(agentData.name) : agentData.name,
        instruction: agentData.instruction ? escapePromptBraces(agentData.instruction) : agentData.instruction
      };

      if (isEditMode && node.data.agent?.id) {
        // Update existing agent
        const { updateAgent } = await import("@/services/agentService");
        const updated = await updateAgent(node.data.agent.id, sanitizedData as any);
        
        // Refresh the agent list
        const res = await listAgents(clientId, 0, 100, selectedFolderId || undefined);
        const filteredAgents = res.data.filter((agent: Agent) => agent.id !== currentAgentId);
        setAllAgents(filteredAgents);
        setAgents(filteredAgents);
        
        if (updated.data) {
          handleSelectAgent(updated.data);
        }
      } else {
        // Create new agent
        const { createAgent } = await import("@/services/agentService");
        const created = await createAgent(sanitizedData as any);

        const res = await listAgents(clientId, 0, 100, selectedFolderId || undefined);
        const filteredAgents = res.data.filter((agent: Agent) => agent.id !== currentAgentId);
        setAllAgents(filteredAgents);
        setAgents(filteredAgents);

        if (created.data) {
          handleSelectAgent(created.data);
        }
      }
      
      setIsAgentDialogOpen(false);
      setIsEditMode(false);
    } catch (e) {
      console.error("Error saving agent:", e);
      setIsAgentDialogOpen(false);
      setIsEditMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderChange = (value: string) => {
    setSelectedFolderId(value === "all" ? null : value);
  };

  const getFolderNameById = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    return folder?.name || id;
  };

  const handleEditAgent = () => {
    if (!node.data.agent) return;
    
    setNewAgent({
      ...node.data.agent,
      client_id: clientId || "",
    });
    
    setIsEditMode(true);
    setIsAgentDialogOpen(true);
  };

  const renderForm = () => {
    return (
      <div className="pb-4 pl-8 pr-8 pt-2 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Select an Agent</h3>
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white"
            onClick={handleOpenAgentDialog}
          >
            + Create new agent
          </Button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for an agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border-gray-600 text-gray-200 focus:border-green-500 py-2 pl-10"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setSearchTerm("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <Select
            value={selectedFolderId || "all"}
            onValueChange={handleFolderChange}
          >
            <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-gray-200 focus:border-green-500">
              <SelectValue placeholder="All Folders" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {agentFolderId && selectedFolderId !== agentFolderId && (
          <div className="mb-4 p-2 bg-green-800/20 border border-green-700/40 rounded-md text-xs text-green-400">
            <div className="flex items-center gap-2">
              <FolderIcon size={12} />
              <span>
                Showing agents from {selectedFolderId ? `folder "${getFolderNameById(selectedFolderId)}"` : "all folders"}. Current workflow agent is in folder "{getFolderNameById(agentFolderId)}".
              </span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="text-green-400 p-0 h-auto mt-1"
              onClick={() => setSelectedFolderId(agentFolderId)}
            >
              Show agents from the same folder as current workflow
            </Button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : agents.length > 0 ? (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    node.data.agent?.id === agent.id
                      ? "bg-green-800 border border-green-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-gray-300" />
                    <span className="font-medium">{agent.name}</span>
                    <div 
                      className="ml-auto text-gray-400 hover:text-yellow-500 transition-colors p-1 rounded hover:bg-yellow-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewAgent({
                          ...agent,
                          client_id: clientId || "",
                        });
                        setIsEditMode(true);
                        setIsAgentDialogOpen(true);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs border-gray-500 text-green-400"
                    >
                      {getAgentTypeName(agent.type)}
                    </Badge>
                    {agent.model && (
                      <span className="text-xs text-gray-400">{agent.model}</span>
                    )}
                  </div>
                  {agent.description && (
                    <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                      {agent.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchTerm || selectedFolderId ? (
              <p>
                No agents found 
                {searchTerm ? ` for "${searchTerm}"` : ""} 
                {selectedFolderId ? ` in this folder` : ""}
              </p>
            ) : (
              <>
                <p>No agents available</p>
                <p className="text-sm mt-2">
                  Create agents in the Agent Management screen
                </p>
              </>
            )}
          </div>
        )}

        {node.data.agent && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-900/20"
                onClick={() => {
                  handleUpdateNode({
                    ...node,
                    data: {
                      ...node.data,
                      agent: undefined,
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Agent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-500 text-green-500 hover:bg-green-900/20"
                onClick={() => setIsTestModalOpen(true)}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Test Agent
              </Button>
            </div>
            {isTestModalOpen && (
              <AgentTestChatModal
                open={isTestModalOpen}
                onOpenChange={setIsTestModalOpen}
                agent={node.data.agent}
              />
            )}
          </div>
        )}

        <GlobalAgentForm
          open={isAgentDialogOpen}
          onOpenChange={(open) => {
            setIsAgentDialogOpen(open);
            if (!open) setIsEditMode(false);
          }}
          initialValues={newAgent}
          apiKeys={apiKeys}
          availableModels={availableModels}
          availableMCPs={availableMCPs}
          agents={allAgents}
          onOpenApiKeysDialog={() => {}}
          onOpenMCPDialog={() => {}}
          onOpenCustomMCPDialog={() => {}}
          onSave={handleSaveAgent}
          isLoading={isLoading}
          getAgentNameById={(id) => allAgents.find((a) => a.id === id)?.name || id}
          clientId={clientId}
        />
      </div>
    );
  };

  return renderForm();
}

export { AgentForm };
