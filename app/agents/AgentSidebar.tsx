"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  FolderPlus,
  Home,
  X,
  CircleEllipsis,
  Edit,
  Trash2,
} from "lucide-react";

interface AgentFolder {
  id: string;
  name: string;
  description: string;
}

interface AgentSidebarProps {
  visible: boolean;
  folders: AgentFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: () => void;
  onEditFolder: (folder: AgentFolder) => void;
  onDeleteFolder: (folder: AgentFolder) => void;
  onClose: () => void;
}

export function AgentSidebar({
  visible,
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
  onClose,
}: AgentSidebarProps) {
  return (
    <>
      <button
        onClick={onClose}
        className={`absolute left-0 top-6 z-20 bg-[#222] p-2 rounded-r-md text-[#00ff9d] hover:bg-[#333] hover:text-[#00ff9d] shadow-md transition-all ${
          visible ? "left-64" : "left-0"
        }`}
        aria-label={visible ? "Hide folders" : "Show folders"}
      >
        {visible ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <Folder className="h-5 w-5" />
            {folders.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#00ff9d] rounded-full border-2 border-[#222]" />
            )}
          </div>
        )}
      </button>

      {visible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`absolute top-0 left-0 h-full w-64 bg-[#1a1a1a] p-4 shadow-xl z-20 transition-all duration-300 ease-in-out ${
          visible ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Folder className="h-5 w-5 mr-2 text-[#00ff9d]" />
            Folders
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#00ff9d] hover:bg-[#222]"
              onClick={onAddFolder}
            >
              <FolderPlus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#00ff9d] hover:bg-[#222]"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <button
            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
              selectedFolderId === null
                ? "bg-[#333] text-[#00ff9d]"
                : "text-gray-300 hover:bg-[#222] hover:text-white"
            }`}
            onClick={() => onSelectFolder(null)}
          >
            <Home className="h-4 w-4 mr-2" />
            <span>All agents</span>
          </button>

          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center group">
              <button
                className={`flex-1 text-left px-3 py-2 rounded-md flex items-center ${
                  selectedFolderId === folder.id
                    ? "bg-[#333] text-[#00ff9d]"
                    : "text-gray-300 hover:bg-[#222] hover:text-white"
                }`}
                onClick={() => onSelectFolder(folder.id)}
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="truncate">{folder.name}</span>
              </button>

              <div className="opacity-0 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#222]"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFolder(folder);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 hover:bg-[#333] hover:text-red-400 focus:bg-[#333]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
