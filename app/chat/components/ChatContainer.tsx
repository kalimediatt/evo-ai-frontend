/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/chat/components/ChatContainer.tsx                                │
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

import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatMessage as ChatMessageType } from "@/services/sessionService";

interface FunctionMessageContent {
  title: string;
  content: string;
  author?: string;
}

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  agentColor: string;
  expandedFunctions: Record<string, boolean>;
  toggleFunctionExpansion: (messageId: string) => void;
  containsMarkdown: (text: string) => boolean;
  getMessageText: (message: ChatMessageType) => string | FunctionMessageContent;
  agentName?: string;
  containerClassName?: string;
  messagesContainerClassName?: string;
  inputContainerClassName?: string;
  sessionId?: string;
}

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
  agentColor,
  expandedFunctions,
  toggleFunctionExpansion,
  containsMarkdown,
  getMessageText,
  agentName = "Agent",
  containerClassName = "",
  messagesContainerClassName = "",
  inputContainerClassName = "",
  sessionId,
}: ChatContainerProps) {
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

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${containerClassName}`}>
      <div 
        className={`flex-1 overflow-hidden p-4 pt-2 ${messagesContainerClassName}`}
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
                Type your message below to start the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4 flex-1">
              {messages.map((message) => {
                const messageContent = getMessageText(message);
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

      <div className={`p-4 border-t border-[#333] bg-[#1a1a1a] ${inputContainerClassName}`}>
        <ChatInput 
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
} 