"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agent } from "@/types/agent";

interface SubAgentsTabProps {
  values: Partial<Agent>;
  onChange: (values: Partial<Agent>) => void;
  agents: Agent[];
  getAgentNameById: (id: string) => string;
  editingAgentId?: string;
}

export function SubAgentsTab({
  values,
  onChange,
  agents,
  getAgentNameById,
  editingAgentId,
}: SubAgentsTabProps) {
  const handleAddSubAgent = (agentId: string) => {
    if (!values.config?.sub_agents?.includes(agentId)) {
      onChange({
        ...values,
        config: {
          ...values.config,
          sub_agents: [...(values.config?.sub_agents || []), agentId],
        },
      });
    }
  };

  const handleRemoveSubAgent = (agentId: string) => {
    onChange({
      ...values,
      config: {
        ...values.config,
        sub_agents:
          values.config?.sub_agents?.filter((id) => id !== agentId) || [],
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          Sub-Agents
        </h3>
        <div className="text-sm text-gray-400">
          {values.config?.sub_agents?.length || 0} sub-agents selected
        </div>
      </div>

      <div className="border border-[#444] rounded-md p-4 bg-[#222]">
        <p className="text-sm text-gray-400 mb-4">
          Select the agents that will be used as sub-agents.
        </p>

        {values.config?.sub_agents && values.config.sub_agents.length > 0 ? (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-white">
              Selected sub-agents:
            </h4>
            <div className="flex flex-wrap gap-2">
              {values.config.sub_agents.map((agentId) => (
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
          <div className="text-center py-4 text-gray-400 mb-4">
            No sub-agents selected
          </div>
        )}

        <h4 className="text-sm font-medium text-white mb-2">
          Available agents:
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {agents
            .filter((agent) => agent.id !== editingAgentId)
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
                    {agent.type === "llm" ? "LLM Agent" : 
                     agent.type === "a2a" ? "A2A Agent" :
                     agent.type === "sequential" ? "Sequential Agent" :
                     agent.type === "parallel" ? "Parallel Agent" :
                     agent.type === "loop" ? "Loop Agent" :
                     agent.type === "workflow" ? "Workflow Agent" : agent.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddSubAgent(agent.id)}
                  disabled={values.config?.sub_agents?.includes(
                    agent.id
                  )}
                  className={
                    values.config?.sub_agents?.includes(
                      agent.id
                    )
                      ? "text-gray-500 bg-[#222] hover:bg-[#333]"
                      : "text-[#00ff9d] hover:bg-[#333] bg-[#222]"
                  }
                >
                  {values.config?.sub_agents?.includes(
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
  );
}
