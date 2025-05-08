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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface Folder {
  id: string;
  name: string;
  description: string;
}

interface FolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (folder: { name: string; description: string }) => Promise<void>;
  editingFolder: Folder | null;
  isLoading?: boolean;
}

export function FolderDialog({
  open,
  onOpenChange,
  onSave,
  editingFolder,
  isLoading = false,
}: FolderDialogProps) {
  const [folder, setFolder] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (editingFolder) {
      setFolder({
        name: editingFolder.name,
        description: editingFolder.description,
      });
    } else {
      setFolder({
        name: "",
        description: "",
      });
    }
  }, [editingFolder, open]);

  const handleSave = async () => {
    await onSave(folder);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle>
            {editingFolder ? "Edit Folder" : "New Folder"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingFolder
              ? "Update the existing folder information"
              : "Fill in the information to create a new folder"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name" className="text-gray-300">
              Folder Name
            </Label>
            <Input
              id="folder-name"
              value={folder.name}
              onChange={(e) =>
                setFolder({ ...folder, name: e.target.value })
              }
              className="bg-[#222] border-[#444] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description" className="text-gray-300">
              Description (optional)
            </Label>
            <Textarea
              id="folder-description"
              value={folder.description}
              onChange={(e) =>
                setFolder({ ...folder, description: e.target.value })
              }
              className="bg-[#222] border-[#444] text-white resize-none h-20"
            />
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
          <Button
            onClick={handleSave}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            disabled={!folder.name || isLoading}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-1"></div>
            ) : null}
            {editingFolder ? "Save Changes" : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
