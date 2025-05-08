"use client";

import { Button } from "@/components/ui/button";
import { Folder, Plus, Search, Server } from "lucide-react";

interface EmptyStateProps {
  type: "no-agents" | "empty-folder" | "search-no-results";
  searchTerm?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  type,
  searchTerm = "",
  onAction,
  actionLabel = "Create Agent",
}: EmptyStateProps) {
  const getIcon = () => {
    switch (type) {
      case "empty-folder":
        return <Folder className="h-16 w-16 text-[#00ff9d]" />;
      case "search-no-results":
        return <Search className="h-16 w-16 text-[#00ff9d]" />;
      case "no-agents":
      default:
        return <Server className="h-16 w-16 text-[#00ff9d]" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "empty-folder":
        return "Empty folder";
      case "search-no-results":
        return "No agents found";
      case "no-agents":
      default:
        return "No agents found";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "empty-folder":
        return "This folder is empty. Add agents or create a new one.";
      case "search-no-results":
        return `We couldn't find any agents that match your search: "${searchTerm}"`;
      case "no-agents":
      default:
        return "You don't have any agents configured. Create your first agent to start!";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="mb-6 p-8 rounded-full bg-[#1a1a1a] border border-[#333]">
        {getIcon()}
      </div>
      <h2 className="text-2xl font-semibold text-white mb-3">{getTitle()}</h2>
      <p className="text-gray-300 mb-6 max-w-md">{getMessage()}</p>
      {onAction && (
        <Button
          onClick={onAction}
          className={
            type === "search-no-results"
              ? "bg-[#222] text-white hover:bg-[#333]"
              : "bg-[#00ff9d] text-black hover:bg-[#00cc7d] px-6 py-2 hover:shadow-[0_0_15px_rgba(0,255,157,0.2)]"
          }
        >
          {type === "search-no-results" ? null : (
            <Plus className="mr-2 h-5 w-5" />
          )}
          {type === "search-no-results" ? "Clear search" : actionLabel}
        </Button>
      )}
    </div>
  );
}
