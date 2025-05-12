/* eslint-disable jsx-a11y/alt-text */
import { useEdges, useNodes } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "@/types/agent";
import { listAgents } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AgentForm as GlobalAgentForm } from "@/app/agents/forms/AgentForm";
import { ApiKey, listApiKeys } from "@/services/agentService";
import { listMCPServers } from "@/services/mcpServerService";
import { availableModels } from "@/types/aiModels";
import { MCPServer } from "@/types/mcpServer";
import { AgentTestChatModal } from "./AgentTestChatModal";

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
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const connectedNode = useMemo(() => {
    const edge = edges.find((edge) => edge.source === selectedNode.id);
    if (!edge) return null;
    const node = nodes.find((node) => node.id === edge.target);
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
    setLoading(true);
    listAgents(clientId)
      .then((res) => {
        const filteredAgents = res.data.filter((agent: Agent) => agent.id !== currentAgentId);
        setAllAgents(filteredAgents);
        setAgents(filteredAgents);
      })
      .catch((error) => console.error("Error loading agents:", error))
      .finally(() => setLoading(false));
  }, [clientId, currentAgentId]);

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
    });
    setIsAgentDialogOpen(true);
  };

  const handleSaveAgent = async (agentData: Partial<Agent>) => {
    setIsLoading(true);
    try {
      const { createAgent } = await import("@/services/agentService");
      const created = await createAgent({ ...(agentData as any), client_id: clientId });

      const res = await listAgents(clientId);
      setAllAgents(res.data.filter((agent: Agent) => agent.id !== currentAgentId));
      setAgents(res.data.filter((agent: Agent) => agent.id !== currentAgentId));

      if (created.data) {
        handleSelectAgent(created.data);
      }
      setIsAgentDialogOpen(false);
    } catch (e) {
      setIsAgentDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
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
        
        <div className="relative mb-4">
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
            {searchTerm ? (
              <p>No agents found for "{searchTerm}"</p>
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
            <Button
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-500 hover:bg-red-900/20"
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
              Remove Agent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-green-500 text-green-500 hover:bg-green-900/20"
              onClick={() => setIsTestModalOpen(true)}
            >
              Test Agent
            </Button>
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
          onOpenChange={setIsAgentDialogOpen}
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
        />
      </div>
    );
  };

  return renderForm();
}

export { AgentForm };
