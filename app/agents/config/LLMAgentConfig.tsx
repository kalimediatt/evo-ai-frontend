"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ApiKey } from "@/services/agentService";
import { Plus } from "lucide-react";

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

interface LLMAgentConfigProps {
  apiKeys: ApiKey[];
  availableModels: ModelOption[];
  values: {
    model?: string;
    api_key_id?: string;
    instruction?: string;
  };
  onChange: (values: any) => void;
  onOpenApiKeysDialog: () => void;
}

export function LLMAgentConfig({
  apiKeys,
  availableModels,
  values,
  onChange,
  onOpenApiKeysDialog,
}: LLMAgentConfigProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="api_key" className="text-right text-gray-300">
          API Key
        </Label>
        <div className="col-span-3 space-y-4">
          <div className="flex items-center">
            <Select
              value={values.api_key_id || ""}
              onValueChange={(value) =>
                onChange({
                  ...values,
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
                    .filter((key) => key.is_active !== false)
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
              onClick={onOpenApiKeysDialog}
              className="ml-2 bg-[#222] text-[#00ff9d] hover:bg-[#333]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {apiKeys.length === 0 && (
            <div className="flex items-center text-xs text-gray-400">
              <span className="inline-block h-3 w-3 mr-1 text-gray-400">i</span>
              <span>
                You need to{" "}
                <Button
                  variant="link"
                  onClick={onOpenApiKeysDialog}
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
        <Label htmlFor="model" className="text-right text-gray-300">
          Model
        </Label>
        <Select
          value={values.model}
          onValueChange={(value) =>
            onChange({
              ...values,
              model: value,
            })
          }
        >
          <SelectTrigger className="col-span-3 bg-[#222] border-[#444] text-white">
            <SelectValue placeholder="Select the model" />
          </SelectTrigger>
          <SelectContent className="bg-[#222] border-[#444] text-white p-0">
            <div className="sticky top-0 z-10 p-2 bg-[#222] border-b border-[#444]">
              <Input
                placeholder="Search models..."
                className="bg-[#333] border-[#444] text-white h-8"
                onChange={(e) => {
                  const searchQuery = e.target.value.toLowerCase();
                  const items = document.querySelectorAll('[data-model-item="true"]');
                  items.forEach((item) => {
                    const text = item.textContent?.toLowerCase() || '';
                    if (text.includes(searchQuery)) {
                      (item as HTMLElement).style.display = 'flex';
                    } else {
                      (item as HTMLElement).style.display = 'none';
                    }
                  });
                }}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto py-1">
              {availableModels
                .filter((model) => {
                  if (!values.api_key_id) return true;

                  const selectedKey = apiKeys.find(
                    (key) => key.id === values.api_key_id
                  );

                  if (!selectedKey) return true;

                  return model.provider === selectedKey.provider;
                })
                .map((model) => (
                  <SelectItem
                    key={model.value}
                    value={model.value}
                    className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                    data-model-item="true"
                  >
                    {model.label}
                  </SelectItem>
                ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="instruction" className="text-right text-gray-300">
          Instructions
        </Label>
        <Textarea
          id="instruction"
          value={values.instruction || ""}
          onChange={(e) =>
            onChange({
              ...values,
              instruction: e.target.value,
            })
          }
          className="col-span-3 bg-[#222] border-[#444] text-white"
          rows={4}
        />
      </div>
    </div>
  );
}
