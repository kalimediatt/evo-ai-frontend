/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/workflows/nodes/components/agent/AgentChatMessageList.tsx │
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

import { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/app/chat/components/ChatMessage";
import { Agent } from "@/types/agent";

interface ChatMessage {
  id: string;
  content: any;
  author: string;
  timestamp: number;
}

interface FunctionMessageContent {
  title: string;
  content: string;
  author?: string;
}

interface AgentChatMessageListProps {
  messages: ChatMessage[];
  agent: Agent;
  expandedFunctions: Record<string, boolean>;
  toggleFunctionExpansion: (messageId: string) => void;
  getMessageText: (message: ChatMessage) => string | FunctionMessageContent;
  containsMarkdown: (text: string) => boolean;
}

export function AgentChatMessageList({
  messages,
  agent,
  expandedFunctions,
  toggleFunctionExpansion,
  getMessageText,
  containsMarkdown,
}: AgentChatMessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getAgentColor = (agentName: string) => {
    const agentColors: Record<string, string> = {
      Assistant: "bg-[#00ff9d]",
      Programmer: "bg-[#00cc7d]",
      Writer: "bg-[#00b8ff]",
      Researcher: "bg-[#ff9d00]",
      Planner: "bg-[#9d00ff]",
      default: "bg-[#333]",
    };
    return agentColors[agentName] || agentColors.default;
  };

  return (
    <div 
      ref={messagesContainerRef} 
      className="flex-1 overflow-y-auto pr-2"
    >
      <div className="space-y-4 w-full max-w-full pb-4" style={{ minHeight: "100%" }}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-gray-400">
            <p>No messages yet. Start typing below.</p>
          </div>
        ) : (
          messages.map((message) => {
            const agentColor = getAgentColor(agent.name);
            const messageContent = getMessageText(message);
            const isExpanded = expandedFunctions[message.id] || false;
            
            return (
              <ChatMessageType
                key={message.id}
                message={message}
                agentColor={agentColor}
                isExpanded={isExpanded}
                toggleExpansion={toggleFunctionExpansion}
                containsMarkdown={containsMarkdown}
                messageContent={messageContent}
              />
            );
          })
        )}
      </div>
    </div>
  );
} 