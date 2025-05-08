"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MCPServer } from "@/types/mcpServer";
import { Server } from "lucide-react";
import { useState, useEffect } from "react";

interface MCPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (mcpConfig: {
    id: string;
    envs: Record<string, string>;
    tools: string[];
  }) => void;
  availableMCPs: MCPServer[];
  selectedMCP?: MCPServer | null;
  initialEnvs?: Record<string, string>;
  initialTools?: string[];
}

export function MCPDialog({
  open,
  onOpenChange,
  onSave,
  availableMCPs,
  selectedMCP: initialSelectedMCP = null,
  initialEnvs = {},
  initialTools = [],
}: MCPDialogProps) {
  const [selectedMCP, setSelectedMCP] = useState<MCPServer | null>(null);
  const [mcpEnvs, setMcpEnvs] = useState<Record<string, string>>({});
  const [selectedMCPTools, setSelectedMCPTools] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (initialSelectedMCP) {
        setSelectedMCP(initialSelectedMCP);
        setMcpEnvs(initialEnvs);
        setSelectedMCPTools(initialTools);
      } else {
        setSelectedMCP(null);
        setMcpEnvs({});
        setSelectedMCPTools([]);
      }
    }
  }, [open, initialSelectedMCP, initialEnvs, initialTools]);

  const handleSelectMCP = (value: string) => {
    const mcp = availableMCPs.find((m) => m.id === value);
    if (mcp) {
      setSelectedMCP(mcp);
      const initialEnvs: Record<string, string> = {};
      Object.keys(mcp.environments || {}).forEach((key) => {
        initialEnvs[key] = "";
      });
      setMcpEnvs(initialEnvs);
      setSelectedMCPTools([]);
    }
  };

  const toggleMCPTool = (tool: string) => {
    if (selectedMCPTools.includes(tool)) {
      setSelectedMCPTools(selectedMCPTools.filter((t) => t !== tool));
    } else {
      setSelectedMCPTools([...selectedMCPTools, tool]);
    }
  };

  const handleSave = () => {
    if (!selectedMCP) return;
    
    onSave({
      id: selectedMCP.id,
      envs: mcpEnvs,
      tools: selectedMCPTools,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-white">
            Configure MCP Server
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select a MCP server and configure its tools.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mcp-select" className="text-gray-300">
                MCP Server
              </Label>
              <Select
                value={selectedMCP?.id}
                onValueChange={handleSelectMCP}
              >
                <SelectTrigger className="bg-[#222] border-[#444] text-white">
                  <SelectValue placeholder="Select a MCP server" />
                </SelectTrigger>
                <SelectContent className="bg-[#222] border-[#444] text-white">
                  {availableMCPs.map((mcp) => (
                    <SelectItem
                      key={mcp.id}
                      value={mcp.id}
                      className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white focus:!text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                    >
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-[#00ff9d]" />
                        {mcp.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMCP && (
              <>
                <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                  <p className="font-medium text-white">{selectedMCP.name}</p>
                  <p className="text-sm text-gray-400">
                    {selectedMCP.description?.substring(0, 100)}...
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>
                      <strong>Type:</strong> {selectedMCP.type}
                    </p>
                    <p>
                      <strong>Configuration:</strong>{" "}
                      {selectedMCP.config_type === "sse" ? "SSE" : "Studio"}
                    </p>
                  </div>
                </div>

                {selectedMCP.environments &&
                  Object.keys(selectedMCP.environments).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-white">
                        Environment Variables
                      </h3>
                      {Object.entries(selectedMCP.environments || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="grid grid-cols-3 items-center gap-4"
                          >
                            <Label
                              htmlFor={`env-${key}`}
                              className="text-right text-gray-300"
                            >
                              {key}
                            </Label>
                            <Input
                              id={`env-${key}`}
                              value={mcpEnvs[key] || ""}
                              onChange={(e) =>
                                setMcpEnvs({
                                  ...mcpEnvs,
                                  [key]: e.target.value,
                                })
                              }
                              className="col-span-2 bg-[#222] border-[#444] text-white"
                              placeholder={value as string}
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}

                {selectedMCP.tools && selectedMCP.tools.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">
                      Available Tools
                    </h3>
                    <div className="border border-[#444] rounded-md p-3 bg-[#222]">
                      {selectedMCP.tools.map((tool: any) => (
                        <div
                          key={tool.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`tool-${tool.id}`}
                            checked={selectedMCPTools.includes(tool.id)}
                            onCheckedChange={() => toggleMCPTool(tool.id)}
                            className="data-[state=checked]:bg-[#00ff9d] data-[state=checked]:border-[#00ff9d]"
                          />
                          <Label
                            htmlFor={`tool-${tool.id}`}
                            className="text-sm text-gray-300"
                          >
                            {tool.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 pt-2 border-t border-[#333]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            disabled={!selectedMCP}
          >
            Add MCP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
