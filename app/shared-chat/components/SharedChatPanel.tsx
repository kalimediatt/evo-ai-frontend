/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/shared-chat/components/SharedChatPanel.tsx                       │
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

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Loader2, Send, Paperclip, X, Image, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage as ChatMessageType } from "@/services/sessionService";
import { ChatMessage } from "@/app/chat/components/ChatMessage";
import { FileData, formatFileSize, isImageFile } from "@/lib/file-utils";
import { useToast } from "@/hooks/use-toast";

interface FunctionMessageContent {
  title: string;
  content: string;
  author?: string;
}

interface SharedChatPanelProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  isSending: boolean;
  agentName?: string;
  onSendMessage: (message: string, files?: FileData[]) => void;
  getMessageText: (message: ChatMessageType) => string | FunctionMessageContent;
  containsMarkdown: (text: string) => boolean;
  sessionId?: string;
}

export function SharedChatPanel({
  messages,
  isLoading,
  isSending,
  agentName = "Shared Agent",
  onSendMessage,
  getMessageText,
  containsMarkdown,
  sessionId,
}: SharedChatPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  const toggleFunctionExpansion = (messageId: string) => {
    setExpandedFunctions((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    
    onSendMessage(messageInput, selectedFiles.length > 0 ? selectedFiles : undefined);
    
    setMessageInput("");
    setSelectedFiles([]);
    
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
          title: `The file ${file.name} exceeds the maximum size of ${formatFileSize(maxFileSize)}.`,
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        className="flex-1 overflow-hidden p-4 pt-2"
        style={{ filter: isLoading ? "blur(2px)" : "none" }}
      >
        <ScrollArea
          ref={messagesContainerRef}
          className="h-full pr-4 overflow-x-hidden"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="p-3 rounded-full bg-[#222] mb-4">
                <MessageSquare className="h-6 w-6 text-[#00ff9d]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {`Chat com ${agentName}`}
              </h3>
              <p className="text-gray-400 max-w-md">
                Type your message below to start a conversation with this shared agent.
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4 flex-1">
              {messages.map((message) => {
                const messageContent = getMessageText(message);
                const agentColor = message.author === "user" ? "bg-[#333]" : "bg-[#00ff9d]";
                const isExpanded = expandedFunctions[message.id] || false;

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    agentColor={agentColor}
                    isExpanded={isExpanded}
                    toggleExpansion={toggleFunctionExpansion}
                    containsMarkdown={containsMarkdown}
                    messageContent={messageContent}
                    sessionId={sessionId}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-[#333] bg-[#1a1a1a]"
      >
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
                  type="button"
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
      
        <div className="flex gap-2 items-end">
          {selectedFiles.length < 5 && (
            <button
              type="button"
              onClick={openFileSelector}
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
            placeholder="Type your message..."
            className="flex-1 bg-[#222] border-[#444] text-white resize-none min-h-[44px] max-h-32"
            disabled={isLoading || isSending}
          />
          <Button
            type="submit"
            disabled={((!messageInput.trim() && selectedFiles.length === 0) || isLoading || isSending)}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] h-[44px] px-4"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelected}
            className="hidden"
            multiple
          />
        </div>
      </form>
    </div>
  );
} 