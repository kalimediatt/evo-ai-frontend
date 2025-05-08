"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder } from "@/services/agentService";
import { Agent, AgentType } from "@/types/agent";
import { MCPServer } from "@/types/mcpServer";
import {
  CircleEllipsis,
  Code,
  Edit,
  ExternalLink,
  GitBranch,
  MoveRight,
  RefreshCw,
  Server,
  Trash2,
  Workflow,
} from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onMove: (agent: Agent) => void;
  onWorkflow?: (agentId: string) => void;
  availableMCPs?: MCPServer[];
  getApiKeyNameById?: (id: string | undefined) => string | null;
  getAgentNameById?: (id: string) => string;
  folders?: Folder[];
}

export function AgentCard({
  agent,
  onEdit,
  onDelete,
  onMove,
  onWorkflow,
  availableMCPs = [],
  getApiKeyNameById = () => null,
  getAgentNameById = (id) => id,
  folders = [],
}: AgentCardProps) {
  const getAgentTypeIcon = (type: AgentType) => {
    const agentTypes = [
      { value: "llm", icon: Code },
      { value: "a2a", icon: ExternalLink },
      { value: "sequential", icon: Workflow },
      { value: "parallel", icon: GitBranch },
      { value: "loop", icon: RefreshCw },
      { value: "workflow", icon: Workflow },
    ];

    const agentType = agentTypes.find((t) => t.value === type);
    if (agentType) {
      const IconComponent = agentType.icon;
      return <IconComponent className="h-5 w-5" />;
    }
    return null;
  };

  const getFolderNameById = (id: string) => {
    const folder = folders?.find((f) => f.id === id);
    return folder?.name || id;
  };

  const getAgentTypeName = (type: AgentType) => {
    const agentTypes = [
      { value: "llm", label: "LLM Agent" },
      { value: "a2a", label: "A2A Agent" },
      { value: "sequential", label: "Sequential Agent" },
      { value: "parallel", label: "Parallel Agent" },
      { value: "loop", label: "Loop Agent" },
      { value: "workflow", label: "Workflow Agent" },
    ];
    return agentTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <Card className="overflow-hidden bg-[#1a1a1a] border-[#333] hover:border-[#00ff9d]/50 hover:shadow-[0_0_15px_rgba(0,255,157,0.15)] transition-all rounded-xl">
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
              onClick={() => onEdit(agent)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            {agent.type === "workflow" && onWorkflow && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-[#333]/50 hover:text-[#00ff9d]"
                onClick={() => onWorkflow(agent.id)}
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
                  onClick={() => onMove(agent)}
                >
                  <MoveRight className="h-4 w-4 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                  onClick={() => onDelete(agent)}
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
                <strong>Instructions (prompt):</strong>{" "}
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
              <span className="truncate block">{agent.agent_card_url}</span>
            </div>
          </div>
        )}

        {agent.type === "loop" && agent.config?.max_iterations && (
          <div className="space-y-1 text-xs text-gray-400">
            <div>
              <strong>Max. Iterations:</strong> {agent.config.max_iterations}
            </div>
          </div>
        )}

        {agent.type === "workflow" && (
          <div className="space-y-1 text-xs text-gray-400">
            <div>
              <strong>Type:</strong> Visual Flow
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

        {agent.config?.sub_agents && agent.config.sub_agents.length > 0 && (
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
                  const mcpServer = availableMCPs.find(
                    (mcp) => mcp.id === mcpConfig.id
                  );
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

        {agent.folder_id && (
          <div className="text-xs text-gray-400 mt-1">
            <strong>Folder:</strong>{" "}
            <Badge className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30">
              {getFolderNameById(agent.folder_id)}
            </Badge>
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
  );
}
