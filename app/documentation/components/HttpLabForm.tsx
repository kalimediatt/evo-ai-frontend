/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/documentation/components/HttpLabForm.tsx                         │
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

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

interface HttpLabFormProps {
  agentUrl: string;
  setAgentUrl: (url: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  message: string;
  setMessage: (message: string) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  taskId: string;
  setTaskId: (id: string) => void;
  callId: string;
  setCallId: (id: string) => void;
  sendRequest: () => Promise<void>;
  isLoading: boolean;
}

export function HttpLabForm({
  agentUrl,
  setAgentUrl,
  apiKey,
  setApiKey,
  message,
  setMessage,
  sessionId,
  setSessionId,
  taskId,
  setTaskId,
  callId,
  setCallId,
  sendRequest,
  isLoading
}: HttpLabFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Agent URL</label>
          <Input
            value={agentUrl}
            onChange={(e) => setAgentUrl(e.target.value)}
            placeholder="http://localhost:8000/api/v1/a2a/your-agent-id"
            className="bg-[#222] border-[#444] text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">API Key (optional)</label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your API key"
            className="bg-[#222] border-[#444] text-white"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm text-gray-400 mb-1 block">Message</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What is the A2A protocol?"
          className="bg-[#222] border-[#444] text-white min-h-[100px]"
        />
      </div>
      
      <Separator className="my-4 bg-[#333]" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Session ID</label>
          <Input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="bg-[#222] border-[#444] text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Task ID</label>
          <Input
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="bg-[#222] border-[#444] text-white"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Call ID</label>
          <Input
            value={callId}
            onChange={(e) => setCallId(e.target.value)}
            className="bg-[#222] border-[#444] text-white"
          />
        </div>
      </div>
      
      <Button 
        onClick={sendRequest}
        disabled={isLoading}
        className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] w-full mt-4"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
            Sending...
          </div>
        ) : (
          <div className="flex items-center">
            <Send className="mr-2 h-4 w-4" />
            Send Request
          </div>
        )}
      </Button>
    </div>
  );
} 