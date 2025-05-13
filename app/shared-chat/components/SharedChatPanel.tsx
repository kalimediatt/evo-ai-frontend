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
import { MessageSquare, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage as ChatMessageType } from "@/services/sessionService";
import { ChatMessage } from "@/app/chat/components/ChatMessage";

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
  onSendMessage: (message: string) => void;
  getMessageText: (message: ChatMessageType) => string | FunctionMessageContent;
  containsMarkdown: (text: string) => boolean;
}

export function SharedChatPanel({
  messages,
  isLoading,
  isSending,
  agentName = "Shared Agent",
  onSendMessage,
  getMessageText,
  containsMarkdown,
}: SharedChatPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput("");
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
    textarea.style.height = `${textarea.scrollHeight}px`;
    setMessageInput(textarea.value);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div 
        className="flex-1 overflow-hidden p-4 pt-2"
        style={{ filter: isLoading ? "blur(2px)" : "none" }}
      >
        <ScrollArea
          ref={messagesContainerRef}
          className="h-full pr-4"
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
        <div className="flex gap-2 items-end">
          <Textarea
            value={messageInput}
            onChange={autoResizeTextarea}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="bg-[#222] border-[#444] text-white resize-none min-h-[44px] max-h-32"
            disabled={isLoading || isSending}
          />
          <Button
            type="submit"
            disabled={!messageInput.trim() || isLoading || isSending}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] h-[44px] px-4"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 