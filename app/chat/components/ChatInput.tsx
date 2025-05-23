/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/chat/components/ChatInput.tsx                                    │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 14, 2025                                                  │
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

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Paperclip, X, Image, FileText, File } from "lucide-react";
import { FileData, formatFileSize, isImageFile } from "@/lib/file-utils";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, files?: FileData[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  containerClassName?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className = "",
  buttonClassName = "",
  containerClassName = "",
}: ChatInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [resetFileUpload, setResetFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    
    onSendMessage(messageInput, selectedFiles.length > 0 ? selectedFiles : undefined);
    
    setMessageInput("");
    setSelectedFiles([]);
    
    setResetFileUpload(true);
    
    setTimeout(() => {
      setResetFileUpload(false);
    }, 100);
    
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 10 * 24;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    setMessageInput(textarea.value);
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    if (selectedFiles.length + newFiles.length > 5) {
      toast({
        title: `You can only attach up to 5 files.`,
        variant: "destructive",
      });
      return;
    }
    
    const validFiles: FileData[] = [];
    
    for (const file of newFiles) {
      if (file.size > maxFileSize) {
        toast({
          title: `File ${file.name} exceeds the maximum size of ${formatFileSize(maxFileSize)}.`,
          variant: "destructive",
        });
        continue;
      }
      
      try {
        const reader = new FileReader();
        
        const readFile = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
        });
        
        reader.readAsDataURL(file);
        
        const base64Data = await readFile;
        const previewUrl = URL.createObjectURL(file);
        
        validFiles.push({
          filename: file.name,
          content_type: file.type,
          data: base64Data,
          size: file.size,
          preview_url: previewUrl
        });
      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          title: `Error processing file ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col w-full ${containerClassName}`}>
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 mb-2">
          {selectedFiles.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center gap-1 bg-[#333] text-white rounded-md p-1.5 text-xs"
            >
              {isImageFile(file.content_type) ? (
                <Image className="h-4 w-4 text-[#00ff9d]" />
              ) : file.content_type === 'application/pdf' ? (
                <FileText className="h-4 w-4 text-[#00ff9d]" />
              ) : (
                <File className="h-4 w-4 text-[#00ff9d]" />
              )}
              <span className="max-w-[120px] truncate">{file.filename}</span>
              <span className="text-gray-400">({formatFileSize(file.size)})</span>
              <button 
                onClick={() => {
                  const updatedFiles = selectedFiles.filter((_, i) => i !== index);
                  setSelectedFiles(updatedFiles);
                }}
                className="ml-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form 
        onSubmit={handleSendMessage} 
        className="flex w-full items-center gap-2 px-2"
      >
        {selectedFiles.length < 5 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              openFileSelector();
            }}
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#333] text-gray-400 hover:text-[#00ff9d] transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        )}
        
        <Textarea
          value={messageInput}
          onChange={autoResizeTextarea}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 bg-[#222] border-[#444] text-white focus-visible:ring-[#00ff9d] min-h-[40px] max-h-[240px] resize-none ${className}`}
          disabled={isLoading}
          rows={1}
        />
        <Button
          type="submit"
          disabled={isLoading || (!messageInput.trim() && selectedFiles.length === 0)}
          className={`bg-[#00ff9d] text-black hover:bg-[#00cc7d] ${buttonClassName}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFilesSelected}
          className="hidden"
          multiple
        />
      </form>
    </div>
  );
} 