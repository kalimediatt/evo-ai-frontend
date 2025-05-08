"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface A2AAgentConfigProps {
  values: {
    agent_card_url?: string;
  };
  onChange: (values: any) => void;
}

export function A2AAgentConfig({ values, onChange }: A2AAgentConfigProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="agent_card_url" className="text-right text-gray-300">
          Agent Card URL
        </Label>
        <Input
          id="agent_card_url"
          value={values.agent_card_url || ""}
          onChange={(e) =>
            onChange({
              ...values,
              agent_card_url: e.target.value,
            })
          }
          placeholder="https://example.com/.well-known/agent-card.json"
          className="col-span-3 bg-[#222] border-[#444] text-white"
        />
      </div>
      <div className="pl-[25%] text-sm text-gray-400">
        <p>
          Provide the full URL for the JSON file of the Agent Card that describes
          this agent.
        </p>
        <p className="mt-2">
          Agent Cards contain metadata, capabilities descriptions and supported
          protocols.
        </p>
      </div>
    </div>
  );
}
