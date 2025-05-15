/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/workflows/nodes/components/agent/AgentTestChatModal.tsx   │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
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
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentWebSocket } from "@/hooks/use-agent-webSocket";
import { getAccessTokenFromCookie } from "@/lib/utils";
import { Agent } from "@/types/agent";
import { ChatInput } from "@/app/chat/components/ChatInput";
import { AgentChatMessageList } from "./AgentChatMessageList";
import { ChatPart } from "@/services/sessionService";
import { FileData } from "@/lib/file-utils";

interface FunctionMessageContent {
    title: string;
    content: string;
    author?: string;
}

interface ChatMessage {
    id: string;
    content: any;
    author: string;
    timestamp: number;
}

interface AgentTestChatModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    agent: Agent;
}

export function AgentTestChatModal({ open, onOpenChange, agent }: AgentTestChatModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({});

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const clientId = user?.client_id || "test";

    const generateExternalId = () => {
        const now = new Date();
        return (
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, "0") +
            now.getDate().toString().padStart(2, "0") +
            now.getHours().toString().padStart(2, "0") +
            now.getMinutes().toString().padStart(2, "0") +
            now.getSeconds().toString().padStart(2, "0") +
            now.getMilliseconds().toString().padStart(3, "0")
        );
    };

    const [externalId] = useState(generateExternalId());
    const jwt = getAccessTokenFromCookie();

    const onEvent = useCallback((event: any) => {
        setMessages((prev) => [...prev, event]);
    }, []);

    const onTurnComplete = useCallback(() => {
        setIsSending(false);
    }, []);

    const { sendMessage: wsSendMessage } = useAgentWebSocket({
        agentId: agent.id,
        externalId,
        jwt,
        onEvent,
        onTurnComplete,
    });

    const handleSendMessageWithFiles = (message: string, files?: FileData[]) => {
        if ((!message.trim() && (!files || files.length === 0))) return;
        setIsSending(true);
        
        const messageParts: ChatPart[] = [];
        
        if (message.trim()) {
          messageParts.push({ text: message });
        }
        
        if (files && files.length > 0) {
          files.forEach(file => {
            messageParts.push({
              inline_data: {
                data: file.data,
                mime_type: file.content_type,
                metadata: {
                  filename: file.filename
                }
              }
            });
          });
        }

        setMessages((prev) => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                content: {
                    parts: messageParts,
                    role: "user"
                },
                author: "user",
                timestamp: Date.now() / 1000,
            },
        ]);
        
        wsSendMessage(message, files);
    };

    const containsMarkdown = (text: string): boolean => {
        if (!text || text.length < 3) return false;
        const markdownPatterns = [
            /[*_]{1,2}[^*_]+[*_]{1,2}/, // bold/italic
            /\[[^\]]+\]\([^)]+\)/, // links
            /^#{1,6}\s/m, // headers
            /^[-*+]\s/m, // unordered lists
            /^[0-9]+\.\s/m, // ordered lists
            /^>\s/m, // block quotes
            /`[^`]+`/, // inline code
            /```[\s\S]*?```/, // code blocks
            /^\|(.+\|)+$/m, // tables
            /!\[[^\]]*\]\([^)]+\)/, // images
        ];
        return markdownPatterns.some((pattern) => pattern.test(text));
    };

    const getMessageText = (message: ChatMessage): string | FunctionMessageContent => {
        const author = message.author;
        const parts = message.content.parts;
        if (!parts || parts.length === 0) return "Empty content";
        const functionCallPart = parts.find((part: any) => part.functionCall || part.function_call);
        const functionResponsePart = parts.find((part: any) => part.functionResponse || part.function_response);
        
        const inlineDataParts = parts.filter((part: any) => part.inline_data);
        
        if (functionCallPart) {
            const funcCall = functionCallPart.functionCall || functionCallPart.function_call || {};
            const args = funcCall.args || {};
            const name = funcCall.name || "unknown";
            const id = funcCall.id || "no-id";
            return {
                author,
                title: `📞 Function call: ${name}`,
                content: `ID: ${id}\nArgs: ${Object.keys(args).length > 0 ? `\n${JSON.stringify(args, null, 2)}` : "{}"}`,
            } as FunctionMessageContent;
        }
        if (functionResponsePart) {
            const funcResponse = functionResponsePart.functionResponse || functionResponsePart.function_response || {};
            const response = funcResponse.response || {};
            const name = funcResponse.name || "unknown";
            const id = funcResponse.id || "no-id";
            const status = response.status || "unknown";
            const statusEmoji = status === "error" ? "❌" : "✅";
            let resultText = "";
            if (status === "error") {
                resultText = `Error: ${response.error_message || "Unknown error"}`;
            } else if (response.report) {
                resultText = `Result: ${response.report}`;
            } else if (response.result && response.result.content) {
                const content = response.result.content;
                if (Array.isArray(content) && content.length > 0 && content[0].text) {
                    try {
                        const textContent = content[0].text;
                        const parsedJson = JSON.parse(textContent);
                        resultText = `Result: \n${JSON.stringify(parsedJson, null, 2)}`;
                    } catch (e) {
                        resultText = `Result: ${content[0].text}`;
                    }
                } else {
                    resultText = `Result:\n${JSON.stringify(response, null, 2)}`;
                }
            } else {
                resultText = `Result:\n${JSON.stringify(response, null, 2)}`;
            }
            return {
                author,
                title: `${statusEmoji} Function response: ${name}`,
                content: `ID: ${id}\n${resultText}`,
            } as FunctionMessageContent;
        }
        
        if (parts.length === 1 && parts[0].text) {
            return {
                author,
                content: parts[0].text,
                title: "Message",
            } as FunctionMessageContent;
        }
        const textParts = parts.filter((part: any) => part.text).map((part: any) => part.text).filter((text: string) => text);
        if (textParts.length > 0) {
            return {
                author,
                content: textParts.join("\n\n"),
                title: "Message",
            } as FunctionMessageContent;
        }
        try {
            return JSON.stringify(parts, null, 2).replace(/\\n/g, "\n");
        } catch (error) {
            return "Unable to interpret message content";
        }
    };

    const toggleFunctionExpansion = (messageId: string) => {
        setExpandedFunctions((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-3xl w-full overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Test Agent: {agent.name}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col h-[500px]">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-[#00ff9d] text-black px-3 py-1 text-sm">
                            {agent.name}
                        </Badge>
                        <span className="text-xs text-gray-400">{agent.model}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
                        <AgentChatMessageList
                          messages={messages}
                          agent={agent}
                          expandedFunctions={expandedFunctions}
                          toggleFunctionExpansion={toggleFunctionExpansion}
                          getMessageText={getMessageText}
                          containsMarkdown={containsMarkdown}
                        />
                    </div>
                    
                    <div className="p-2 border-t border-[#333] bg-[#1a1a1a] mt-2">
                        <ChatInput
                          onSendMessage={handleSendMessageWithFiles}
                          isLoading={isSending}
                          placeholder="Type your message..."
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 