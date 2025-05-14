/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/config/CrewAIConfig.tsx                                   │
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
"use client";

import { Agent, TaskConfig } from "@/types/agent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, ArrowDown, List, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface CrewAIConfigProps {
  values: Partial<Agent>;
  onChange: (values: Partial<Agent>) => void;
  agents: Agent[];
  getAgentNameById: (id: string) => string;
}

const getAgentTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    llm: "LLM",
    a2a: "A2A",
    sequential: "Sequential",
    parallel: "Parallel",
    loop: "Loop",
    workflow: "Workflow",
    crew_ai: "Crew AI",
  };
  return typeMap[type] || type;
};

const getAgentTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    llm: "bg-blue-800 text-white",
    a2a: "bg-purple-800 text-white",
    sequential: "bg-orange-800 text-white",
    parallel: "bg-green-800 text-white",
    loop: "bg-pink-800 text-white",
    workflow: "bg-yellow-800 text-black",
    crew_ai: "bg-red-800 text-white",
  };
  return colorMap[type] || "bg-gray-800 text-white";
};

export function CrewAIConfig({
  values,
  onChange,
  agents,
  getAgentNameById,
}: CrewAIConfigProps) {
  const [newTask, setNewTask] = useState<TaskConfig>({
    agent_id: "",
    description: "",
    expected_output: "",
  });

  const [taskAgentSearchQuery, setTaskAgentSearchQuery] = useState<string>("");
  const [filteredTaskAgents, setFilteredTaskAgents] = useState<Agent[]>([]);

  const getAvailableTaskAgents = () =>
    agents.filter(
      (agent) =>
        agent.id !== values.id &&
        !values.config?.tasks?.some((task) => task.agent_id === agent.id)
    );

  useEffect(() => {
    const availableAgents = getAvailableTaskAgents();
    if (taskAgentSearchQuery.trim() === "") {
      setFilteredTaskAgents(availableAgents);
    } else {
      const query = taskAgentSearchQuery.toLowerCase();
      setFilteredTaskAgents(
        availableAgents.filter(
          (agent) =>
            agent.name.toLowerCase().includes(query) ||
            (agent.description?.toLowerCase() || "").includes(query)
        )
      );
    }
  }, [taskAgentSearchQuery, agents, values.config?.tasks]);

  useEffect(() => {
    setFilteredTaskAgents(getAvailableTaskAgents());
  }, [agents, values.config?.tasks]);

  const handleAddTask = () => {
    if (!newTask.agent_id || !newTask.description) {
      return;
    }

    const tasks = [...(values.config?.tasks || [])];
    tasks.push(newTask);

    onChange({
      ...values,
      config: {
        ...(values.config || {}),
        tasks,
      },
    });

    setNewTask({
      agent_id: "",
      description: "",
      expected_output: "",
    });
  };

  const handleRemoveTask = (index: number) => {
    const tasks = [...(values.config?.tasks || [])];
    tasks.splice(index, 1);

    onChange({
      ...values,
      config: {
        ...(values.config || {}),
        tasks,
      },
    });
  };

  const renderAgentTypeBadge = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
        return null;
    }

    return (
      <Badge className={`ml-2 ${getAgentTypeColor(agent.type)} text-xs`}>
        {getAgentTypeLabel(agent.type)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white flex items-center">
            <List className="mr-2 h-5 w-5 text-[#00ff9d]" />
            Tasks
          </h3>
        </div>

        <div className="border border-[#444] rounded-md p-4 bg-[#222]">
          <p className="text-sm text-gray-400 mb-4">
            Configure the sequential tasks that will be executed by the team of
            agents.
          </p>

          {values.config?.tasks && values.config.tasks.length > 0 ? (
            <div className="space-y-4 mb-4">
              {values.config.tasks.map((task, index) => (
                <div
                  key={index}
                  className="border border-[#333] rounded-md p-3 bg-[#2a2a2a]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#333] px-2 py-1 text-xs text-white mr-2">
                          {index + 1}
                        </span>
                        <h4 className="font-medium text-white flex items-center">
                          {getAgentNameById(task.agent_id)}
                          {renderAgentTypeBadge(task.agent_id)}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {task.description}
                      </p>
                      {task.expected_output && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-400">
                            Expected output:
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-[#333] text-[#00ff9d] border-[#00ff9d]/30"
                          >
                            {task.expected_output}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTask(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-[#333]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < (values.config?.tasks?.length || 0) - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowDown className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 mb-4 bg-[#2a2a2a] rounded-md">
              <p className="text-gray-400">No tasks configured</p>
              <p className="text-xs text-gray-500">
                Add tasks to define the workflow of the team
              </p>
            </div>
          )}

          <div className="space-y-3 border-t border-[#333] pt-4">
            <h4 className="text-sm font-medium text-white">
              Add new task
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label
                  htmlFor="agent_id"
                  className="text-xs text-gray-400 mb-1 block"
                >
                  Agent
                </Label>
                <Select
                  value={newTask.agent_id}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, agent_id: value })
                  }
                >
                  <SelectTrigger className="bg-[#2a2a2a] border-[#444] text-white">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a2a] border-[#444] text-white p-0">
                    <div className="sticky top-0 z-10 p-2 bg-[#2a2a2a] border-b border-[#444]">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search agents..."
                          className="bg-[#333] border-[#444] text-white h-8 pl-8"
                          value={taskAgentSearchQuery}
                          onChange={(e) =>
                            setTaskAgentSearchQuery(e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto py-1">
                      {filteredTaskAgents.length > 0 ? (
                        filteredTaskAgents.map((agent) => (
                          <SelectItem
                            key={agent.id}
                            value={agent.id}
                            className="hover:bg-[#333] focus:bg-[#333] flex items-center justify-between px-2"
                            data-agent-item="true"
                          >
                            <div className="flex items-center">
                              <span className="mr-2">{agent.name}</span>
                              <Badge
                                className={`${getAgentTypeColor(
                                  agent.type
                                )} text-xs`}
                              >
                                {getAgentTypeLabel(agent.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-gray-500 px-4 py-2 text-center">
                          No agents found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label
                  htmlFor="description"
                  className="text-xs text-gray-400 mb-1 block"
                >
                  Task description
                </Label>
                <Input
                  id="description"
                  placeholder="Describe the task"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="bg-[#2a2a2a] border-[#444] text-white"
                />
                <div className="mt-1 text-xs text-gray-400">
                  <span className="inline-block h-3 w-3 mr-1">ℹ️</span>
                  <span>
                    Use {"{"}content{"}"} to insert the user's input.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="expected_output"
                className="text-xs text-gray-400 mb-1 block"
              >
                Expected output (optional)
              </Label>
              <Input
                id="expected_output"
                placeholder="Ex: JSON report, List of recommendations, etc."
                value={newTask.expected_output}
                onChange={(e) =>
                  setNewTask({ ...newTask, expected_output: e.target.value })
                }
                className="bg-[#2a2a2a] border-[#444] text-white"
              />
            </div>

            <Button
              onClick={handleAddTask}
              disabled={!newTask.agent_id || !newTask.description}
              className="w-full mt-2 bg-[#222] text-[#00ff9d] border border-[#00ff9d] hover:bg-[#00ff9d]/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
