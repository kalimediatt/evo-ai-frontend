/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/chat/components/ChatMessage.tsx                                  │
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
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/services/sessionService";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FunctionMessageContent {
  title: string;
  content: string;
  author?: string;
}

interface ChatMessageProps {
  message: ChatMessageType;
  agentColor: string;
  isExpanded: boolean;
  toggleExpansion: (messageId: string) => void;
  containsMarkdown: (text: string) => boolean;
  messageContent: string | FunctionMessageContent;
}

export function ChatMessage({
  message,
  agentColor,
  isExpanded,
  toggleExpansion,
  containsMarkdown,
  messageContent,
}: ChatMessageProps) {
  const isUser = message.author === "user";
  const hasFunctionCall = message.content.parts.some(
    (part) => part.functionCall || part.function_call
  );
  const hasFunctionResponse = message.content.parts.some(
    (part) => part.functionResponse || part.function_response
  );
  const isFunctionMessage = hasFunctionCall || hasFunctionResponse;

  return (
    <div
      key={message.id}
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
    >
      <div
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} max-w-[90%]`}
      >
        <Avatar className={isUser ? "bg-[#333]" : agentColor}>
          <AvatarFallback>
            {isUser ? "U" : message.author[0]}
          </AvatarFallback>
        </Avatar>
        <div
          className={`rounded-lg p-3 ${
            isFunctionMessage
              ? "bg-[#333] text-[#00ff9d] font-mono text-sm"
              : isUser
              ? "bg-[#00ff9d] text-black"
              : "bg-[#222] text-white"
          } w-full overflow-hidden`}
          style={{ wordBreak: "break-word" }}
        >
          {isFunctionMessage ? (
            <div className="w-full">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-[#444] rounded px-1 py-0.5 transition-colors"
                onClick={() => toggleExpansion(message.id)}
              >
                {typeof messageContent === "object" &&
                  "title" in messageContent && (
                    <>
                      <div className="flex-1 font-semibold">
                        {(messageContent as FunctionMessageContent).title}
                      </div>
                      <div className="flex items-center justify-center w-5 h-5 text-[#00ff9d]">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </>
                  )}
              </div>

              {isExpanded &&
                typeof messageContent === "object" &&
                "content" in messageContent && (
                  <div className="mt-2 pt-2 border-t border-[#555]">
                    <pre className="whitespace-pre-wrap break-all overflow-hidden text-xs">
                      {(messageContent as FunctionMessageContent).content}
                    </pre>
                  </div>
                )}
            </div>
          ) : (
            <div className="markdown-content break-words">
              {typeof messageContent === "object" &&
                "author" in messageContent &&
                messageContent.author !== "user" && (
                  <div className="text-xs text-gray-400 mb-1">
                    {messageContent.author}
                  </div>
                )}
              {(typeof messageContent === "string" &&
                containsMarkdown(messageContent)) ||
              (typeof messageContent === "object" &&
                "content" in messageContent &&
                typeof messageContent.content === "string" &&
                containsMarkdown(messageContent.content)) ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1 className="text-xl font-bold my-4" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-lg font-bold my-3" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-base font-bold my-2" {...props} />
                    ),
                    h4: ({ ...props }) => (
                      <h4 className="font-semibold my-2" {...props} />
                    ),
                    p: ({ ...props }) => <p className="mb-3" {...props} />,
                    ul: ({ ...props }) => (
                      <ul
                        className="list-disc pl-6 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    ol: ({ ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-3 space-y-1"
                        {...props}
                      />
                    ),
                    li: ({ ...props }) => <li className="mb-1" {...props} />,
                    a: ({ ...props }) => (
                      <a
                        className="text-[#00ff9d] underline hover:opacity-80 transition-opacity"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border-l-4 border-[#444] pl-4 py-1 italic my-3 text-gray-300"
                        {...props}
                      />
                    ),
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline =
                        !match &&
                        typeof children === "string" &&
                        !children.includes("\n");

                      if (isInline) {
                        return (
                          <code
                            className="bg-[#333] px-1.5 py-0.5 rounded text-[#00ff9d] text-sm font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <pre className="bg-[#2a2a2a] p-3 rounded-md my-3 overflow-x-auto">
                          <code
                            className="text-[#00ff9d] font-mono text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    pre: ({ ...props }) => (
                      <pre
                        className="bg-[#2a2a2a] p-0 rounded-md my-3 overflow-x-auto font-mono text-sm"
                        {...props}
                      />
                    ),
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-3 rounded border border-[#444]">
                        <table
                          className="min-w-full border-collapse text-sm"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ ...props }) => (
                      <thead className="bg-[#333]" {...props} />
                    ),
                    th: ({ ...props }) => (
                      <th
                        className="py-2 px-3 text-left font-semibold border-b border-[#444] text-[#00ff9d]"
                        {...props}
                      />
                    ),
                    tr: ({ ...props }) => (
                      <tr
                        className="border-b border-[#444] last:border-0"
                        {...props}
                      />
                    ),
                    td: ({ ...props }) => (
                      <td className="py-2 px-3" {...props} />
                    ),
                    img: ({ ...props }) => (
                      <img
                        className="max-w-full h-auto rounded my-2"
                        {...props}
                        alt={props.alt || "Image"}
                      />
                    ),
                    hr: ({ ...props }) => (
                      <hr
                        className="my-6 border-t border-[#444]"
                        {...props}
                      />
                    ),
                  }}
                >
                  {typeof messageContent === "string"
                    ? messageContent
                    : messageContent.content}
                </ReactMarkdown>
              ) : (
                <p>
                  {typeof messageContent === "string"
                    ? messageContent
                    : messageContent.content}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 