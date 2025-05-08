"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Agent } from "@/types/agent";
import { Folder, Home } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  description: string;
}

interface MoveAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  folders: Folder[];
  onMove: (folderId: string | null) => Promise<void>;
  isLoading?: boolean;
}

export function MoveAgentDialog({
  open,
  onOpenChange,
  agent,
  folders,
  onMove,
  isLoading = false,
}: MoveAgentDialogProps) {
  const handleMove = async (folderId: string | null) => {
    await onMove(folderId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle>Move Agent</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a folder to move the agent "{agent?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <button
              className="w-full text-left px-4 py-3 rounded-md flex items-center bg-[#222] border border-[#444] hover:bg-[#333] hover:border-[#00ff9d]/50 transition-colors"
              onClick={() => handleMove(null)}
              disabled={isLoading}
            >
              <Home className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Remove from folder</div>
                <p className="text-sm text-gray-400">
                  The agent will be visible in "All agents"
                </p>
              </div>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                className="w-full text-left px-4 py-3 rounded-md flex items-center bg-[#222] border border-[#444] hover:bg-[#333] hover:border-[#00ff9d]/50 transition-colors"
                onClick={() => handleMove(folder.id)}
                disabled={isLoading}
              >
                <Folder className="h-5 w-5 mr-3 text-[#00ff9d]" />
                <div>
                  <div className="font-medium">{folder.name}</div>
                  {folder.description && (
                    <p className="text-sm text-gray-400 truncate">
                      {folder.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
          >
            Cancel
          </Button>
          {isLoading && (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-[#00ff9d] border-t-transparent rounded-full mr-2"></div>
              <span className="text-gray-400">Moving...</span>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
