import { useState, useRef, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgentWebSocket } from "@/hooks/use-agent-webSocket";
import { getAccessTokenFromCookie } from "@/lib/utils";
import { Agent } from "@/types/agent";

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
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({});
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
    const clientId = user?.client_id || "test";

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

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
        setTimeout(scrollToBottom, 100);
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        setIsSending(true);
        setMessages((prev) => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                content: {
                    parts: [{ text: messageInput }],
                    role: "user",
                },
                author: "user",
                timestamp: Date.now() / 1000,
            },
        ]);
        wsSendMessage(messageInput);
        setMessageInput("");
        const textarea = document.querySelector("textarea");
        if (textarea) textarea.style.height = "auto";
        setTimeout(scrollToBottom, 100);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-2xl w-full">
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
                    <ScrollArea className="flex-1 pr-2" ref={messagesContainerRef}>
                        <div className="space-y-4 w-full max-w-full">
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-center text-gray-400">
                                    <p>No messages yet. Start typing below.</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isUser = message.author === "user";
                                    const agentColor = getAgentColor(agent.name);
                                    const messageContent = getMessageText(message);
                                    const hasFunctionCall = message.content.parts.some((part: any) => part.functionCall || part.function_call);
                                    const hasFunctionResponse = message.content.parts.some((part: any) => part.functionResponse || part.function_response);
                                    const isFunctionMessage = hasFunctionCall || hasFunctionResponse;
                                    const isExpanded = expandedFunctions[message.id] || false;
                                    return (
                                        <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
                                            <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} max-w-[90%]`}>
                                                <Avatar className={isUser ? "bg-[#333]" : agentColor}>
                                                    <AvatarFallback>{isUser ? "U" : agent.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className={`rounded-lg p-3 ${isFunctionMessage ? "bg-[#333] text-[#00ff9d] font-mono text-sm" : isUser ? "bg-[#00ff9d] text-black" : "bg-[#222] text-white"} w-full overflow-hidden`} style={{ wordBreak: "break-word" }}>
                                                    {isFunctionMessage ? (
                                                        <div className="w-full">
                                                            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#444] rounded px-1 py-0.5 transition-colors" onClick={() => toggleFunctionExpansion(message.id)}>
                                                                {typeof messageContent === "object" && "title" in messageContent && (
                                                                    <>
                                                                        <div className="flex-1 font-semibold">{(messageContent as FunctionMessageContent).title}</div>
                                                                        <div className="flex items-center justify-center w-5 h-5 text-[#00ff9d]">
                                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {isExpanded && typeof messageContent === "object" && "content" in messageContent && (
                                                                <div className="mt-2 pt-2 border-t border-[#555]">
                                                                    <pre className="whitespace-pre-wrap break-all overflow-hidden text-xs">{(messageContent as FunctionMessageContent).content}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="markdown-content break-words">
                                                            {typeof messageContent === "object" && "author" in messageContent && messageContent.author !== "user" && (
                                                                <div className="text-xs text-gray-400 mb-1">{messageContent.author}</div>
                                                            )}
                                                            {(typeof messageContent === "string" && containsMarkdown(messageContent)) ||
                                                            (typeof messageContent === "object" && "content" in messageContent && typeof messageContent.content === "string" && containsMarkdown(messageContent.content)) ? (
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{typeof messageContent === "string" ? messageContent : typeof messageContent === "object" && "content" in messageContent ? messageContent.content : ""}</ReactMarkdown>
                                                            ) : (
                                                                <span>{typeof messageContent === "string" ? messageContent : typeof messageContent === "object" && "content" in messageContent ? messageContent.content : JSON.stringify(messageContent)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-2 border-t border-[#333] bg-[#1a1a1a] mt-2">
                        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                            <Textarea
                                value={messageInput}
                                onChange={autoResizeTextarea}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                className="flex-1 bg-[#222] border-[#444] text-white focus-visible:ring-[#00ff9d] min-h-[40px] max-h-[240px] resize-none"
                                disabled={isSending}
                                rows={1}
                            />
                            <Button
                                type="submit"
                                disabled={isSending || !messageInput.trim()}
                                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] mt-2">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 