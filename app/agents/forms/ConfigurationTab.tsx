"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agent } from "@/types/agent";
import { MCPServer } from "@/types/mcpServer";
import { Plus, Server, Settings, X } from "lucide-react";
import { ParallelAgentConfig } from "../config/ParallelAgentConfig";
import { SequentialAgentConfig } from "../config/SequentialAgentConfig";
import { ApiKey } from "@/services/agentService";
import { LoopAgentConfig } from "../config/LoopAgentConfig copy";
import { A2AAgentConfig } from "../config/A2AAgentConfig";
import { useState } from "react";
import { MCPDialog } from "../dialogs/MCPDialog";
import { CustomMCPDialog } from "../dialogs/CustomMCPDialog";

interface ConfigurationTabProps {
  values: Partial<Agent>;
  onChange: (values: Partial<Agent>) => void;
  agents: Agent[];
  availableMCPs: MCPServer[];
  apiKeys: ApiKey[];
  availableModels: any[];
  getAgentNameById: (id: string) => string;
  onOpenApiKeysDialog: () => void;
  onConfigureMCP: (mcpConfig: any) => void;
  onRemoveMCP: (mcpId: string) => void;
  onConfigureCustomMCP: (customMCP: any) => void;
  onRemoveCustomMCP: (url: string) => void;
  onOpenMCPDialog: (mcpConfig?: any) => void;
  onOpenCustomMCPDialog: (customMCP?: any) => void;
}

export function ConfigurationTab({
  values,
  onChange,
  agents,
  availableMCPs,
  apiKeys,
  availableModels,
  getAgentNameById,
  onOpenApiKeysDialog,
  onConfigureMCP,
  onRemoveMCP,
  onConfigureCustomMCP,
  onRemoveCustomMCP,
  onOpenMCPDialog,
  onOpenCustomMCPDialog,
}: ConfigurationTabProps) {
  if (values.type === "llm") {
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            MCP Servers
          </h3>
          <div className="border border-[#444] rounded-md p-4 bg-[#222]">
            <p className="text-sm text-gray-400 mb-4">
              Configure the MCP servers that this agent can use.
            </p>

            {values.config?.mcp_servers &&
            values.config.mcp_servers.length > 0 ? (
              <div className="space-y-2">
                {values.config.mcp_servers.map(
                  (mcpConfig) => {
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
                            onClick={() => onConfigureMCP(mcpConfig)}
                            className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                          >
                            <Settings className="h-4 w-4 mr-1" />{" "}
                            Configure
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveMCP(mcpConfig.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  }
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenMCPDialog(null)}
                  className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add MCP Server
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
                  onClick={() => onOpenMCPDialog(null)}
                  className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">
            Custom MCPs
          </h3>
          <div className="border border-[#444] rounded-md p-4 bg-[#222]">
            <p className="text-sm text-gray-400 mb-4">
              Configure custom MCPs with URL and HTTP headers.
            </p>

            {values.config?.custom_mcp_servers &&
            values.config.custom_mcp_servers.length > 0 ? (
              <div className="space-y-2">
                {values.config.custom_mcp_servers.map(
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
                          onClick={() => onConfigureCustomMCP(customMCP)}
                          className="flex items-center text-gray-300 hover:text-[#00ff9d] hover:bg-[#333]"
                        >
                          <Settings className="h-4 w-4 mr-1" />{" "}
                          Configure
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCustomMCP(customMCP.url)}
                          className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenCustomMCPDialog(null)}
                  className="w-full mt-2 border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Custom MCP
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
                  onClick={() => onOpenCustomMCPDialog(null)}
                  className="border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 bg-[#222] hover:text-[#00ff9d]"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (values.type === "a2a") {
    return (
      <A2AAgentConfig
        values={values}
        onChange={onChange}
      />
    );
  }

  if (values.type === "sequential") {
    return (
      <SequentialAgentConfig
        values={values}
        onChange={onChange}
        agents={agents}
        getAgentNameById={getAgentNameById}
      />
    );
  }

  if (values.type === "parallel") {
    return (
      <ParallelAgentConfig
        values={values}
        onChange={onChange}
        agents={agents}
        getAgentNameById={getAgentNameById}
      />
    );
  }

  if (values.type === "loop") {
    return (
      <LoopAgentConfig
        values={values}
        onChange={onChange}
        agents={agents}
        getAgentNameById={getAgentNameById}
      />
    );
  }

  return (
    <div className="flex items-center justify-center h-40">
      <div className="text-center">
        <p className="text-gray-400">
          Configure the sub-agents in the "Sub-Agents" tab
        </p>
      </div>
    </div>
  );
}
