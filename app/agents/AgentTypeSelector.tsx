"use client";

import { AgentType } from "@/types/agent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code,
  ExternalLink,
  GitBranch,
  RefreshCw,
  Workflow,
} from "lucide-react";

interface AgentTypeSelectorProps {
  value: AgentType;
  onValueChange: (value: AgentType) => void;
  className?: string;
}

export function AgentTypeSelector({
  value,
  onValueChange,
  className = "",
}: AgentTypeSelectorProps) {
  const agentTypes = [
    { value: "llm", label: "LLM Agent", icon: Code },
    { value: "a2a", label: "A2A Agent", icon: ExternalLink },
    { value: "sequential", label: "Sequential Agent", icon: Workflow },
    { value: "parallel", label: "Parallel Agent", icon: GitBranch },
    { value: "loop", label: "Loop Agent", icon: RefreshCw },
    { value: "workflow", label: "Workflow Agent", icon: Workflow },
  ];

  return (
    <Select
      value={value}
      onValueChange={(value: AgentType) => onValueChange(value)}
    >
      <SelectTrigger
        className={`bg-[#222] border-[#444] text-white ${className}`}
      >
        <SelectValue placeholder="Select type" />
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
  );
}
