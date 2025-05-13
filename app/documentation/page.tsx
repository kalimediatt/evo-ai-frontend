/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/documentation/page.tsx                                           │
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

import { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Code,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";

import { DocumentationSection } from "./components/DocumentationSection";
import { TechnicalDetailsSection } from "./components/TechnicalDetailsSection";
import { FrontendImplementationSection } from "./components/FrontendImplementationSection";
import { CodeBlock } from "./components/CodeBlock";
import { CodeExamplesSection } from "./components/CodeExamplesSection";

function DocumentationContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const agentUrlParam = searchParams.get("agent_url");
  const apiKeyParam = searchParams.get("api_key");

  const [agentUrl, setAgentUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(
    `session-${Math.random().toString(36).substring(2, 9)}`
  );
  const [taskId, setTaskId] = useState(
    `task-${Math.random().toString(36).substring(2, 9)}`
  );
  const [callId, setCallId] = useState(
    `call-${Math.random().toString(36).substring(2, 9)}`
  );
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mainTab, setMainTab] = useState("docs");
  const [labMode, setLabMode] = useState("http");

  // Streaming states
  const [streamResponse, setStreamResponse] = useState("");
  const [streamStatus, setStreamStatus] = useState("");
  const [streamHistory, setStreamHistory] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamComplete, setStreamComplete] = useState(false);

  // Debug state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Types for A2A messages
  interface MessagePart {
    type: string;
    text: string;
  }

  useEffect(() => {
    if (agentUrlParam) {
      setAgentUrl(agentUrlParam);
    }
    if (apiKeyParam) {
      setApiKey(apiKeyParam);
    }
  }, [agentUrlParam, apiKeyParam]);

  // Standard HTTP request
  const jsonRpcRequest = {
    jsonrpc: "2.0",
    method: "tasks/send",
    params: {
      message: {
        role: "user",
        parts: [
          {
            type: "text",
            text: message || "What is the A2A protocol?",
          },
        ],
      },
      sessionId: sessionId,
      id: taskId,
    },
    id: callId,
  };

  // Streaming request
  const streamRpcRequest = {
    jsonrpc: "2.0",
    method: "tasks/sendSubscribe",
    params: {
      message: {
        role: "user",
        parts: [
          {
            type: "text",
            text: message || "What is the A2A protocol?",
          },
        ],
      },
      sessionId: sessionId,
      id: taskId,
    },
    id: callId,
  };

  // Code examples
  const curlExample = `curl -X POST \\
  ${agentUrl || "http://localhost:8000/api/v1/a2a/your-agent-id"} \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: ${apiKey || "your-api-key"}' \\
  -d '${JSON.stringify(jsonRpcRequest, null, 2)}'`;

  const fetchExample = `async function testA2AAgent() {
  const response = await fetch(
    '${agentUrl || "http://localhost:8000/api/v1/a2a/your-agent-id"}',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey || "your-api-key"}'
      },
      body: JSON.stringify(${JSON.stringify(jsonRpcRequest, null, 2)})
    }
  );
  
  const data = await response.json();
  console.log('Agent response:', data);
}`;

  // Function to add debug logs
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].substring(0, 8);
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DEBUG] ${message}`);
  };

  // Standard HTTP request method
  const sendRequest = async () => {
    if (!agentUrl) {
      toast({
        title: "Agent URL required",
        description: "Please enter the agent URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    addDebugLog("Sending HTTP request to: " + agentUrl);
    addDebugLog("Payload: " + JSON.stringify(jsonRpcRequest));

    try {
      const response = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify(jsonRpcRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog(`HTTP error: ${response.status} ${response.statusText}`);
        addDebugLog(`Error response: ${errorText}`);
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      addDebugLog("Successfully received response");
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      addDebugLog(`Request failed: ${errorMsg}`);
      toast({
        title: "Error sending request",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process event stream
  const processEventStream = async (response: Response) => {
    try {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      addDebugLog("Starting event stream processing...");
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          addDebugLog("Stream finished by server");
          setStreamComplete(true);
          setIsStreaming(false);
          break;
        }
        
        // Decode chunk of data
        const chunk = decoder.decode(value, { stream: true });
        addDebugLog(`Received chunk (${value.length} bytes)`);
        
        // Add to buffer
        buffer += chunk;
        
        // Process complete events in buffer
        // We use regex to identify complete "data:" events
        // A complete SSE event ends with two newlines (\n\n)
        const regex = /data:\s*({.*?})\s*(?:\n\n|\r\n\r\n)/g;
        
        let match;
        let processedPosition = 0;
        
        // Extract all complete "data:" events
        while ((match = regex.exec(buffer)) !== null) {
          const jsonStr = match[1].trim();
          addDebugLog(`Complete event found: ${jsonStr.substring(0, 50)}...`);
          
          try {
            // Process the JSON of the event
            const data = JSON.parse(jsonStr);
            
            // Add to history
            setStreamHistory(prev => [...prev, jsonStr]);
            
            // Process the data obtained
            processStreamData(data);
            
            // Update the processed position to remove from buffer after
            processedPosition = match.index + match[0].length;
          } catch (jsonError) {
            addDebugLog(`Error processing JSON: ${jsonError}`);
            // Continue processing other events even with error in one of them
          }
        }
        
        // Remove the processed part of the buffer
        if (processedPosition > 0) {
          buffer = buffer.substring(processedPosition);
        }
        
        // Check if the buffer is too large (indicates invalid data)
        if (buffer.length > 10000) {
          addDebugLog("Buffer too large, clearing old data");
          // Keep only the last part of the buffer that may contain a partial event
          buffer = buffer.substring(buffer.length - 5000);
        }
        
        // Remove ping events from buffer
        if (buffer.includes(": ping")) {
          addDebugLog("Ping event detected, clearing buffer");
          buffer = buffer.replace(/:\s*ping.*?(?:\n\n|\r\n\r\n)/g, "");
        }
      }
    } catch (streamError) {
      const errorMsg =
        streamError instanceof Error
          ? streamError.message
          : "Unknown error";
      addDebugLog(`Error processing stream: ${errorMsg}`);
      console.error("Error processing stream:", streamError);
      toast({
        title: "Error processing stream",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };
  
  // Process a received streaming event
  const processStreamData = (data: any) => {
    // Add log to see the complete structure of the data
    addDebugLog(`Processing data: ${JSON.stringify(data).substring(0, 100)}...`);
    
    // Validate if data follows the JSON-RPC 2.0 format
    if (!data.jsonrpc || data.jsonrpc !== "2.0" || !data.result) {
      addDebugLog("Invalid event format, ignoring");
      return;
    }
    
    const result = data.result;
    
    // Process status if available (TaskStatusUpdateEvent)
    if (result.status) {
      const status = result.status;
      const state = status.state;
      
      addDebugLog(`Current status: ${state}`);
      setStreamStatus(state);
      
      // Process partial response message, if available
      if (status.message) {
        const message = status.message;
        const parts = message.parts?.filter(
          (part: any) => part.type === "text"
        );
        
        if (parts && parts.length > 0) {
          const currentMessageText = parts
            .map((part: any) => part.text)
            .join("");
          
          addDebugLog(`Current message text: "${currentMessageText.substring(0, 50)}${currentMessageText.length > 50 ? '...' : ''}"`);
          
          if (currentMessageText.trim()) {
            // If the text is not empty, display it
            setStreamResponse(currentMessageText);
          }
        }
      }
      
      // Check if it is the final event
      if (result.final === true) {
        addDebugLog("Final event received");
        setStreamComplete(true);
        setIsStreaming(false);
      }
    }
    
    // Process artifact if available (TaskArtifactUpdateEvent)
    if (result.artifact) {
      const artifact = result.artifact;
      addDebugLog(`Received artifact with ${artifact.parts?.length || 0} parts`);
      
      // Check if there are parts
      if (artifact.parts && artifact.parts.length > 0) {
        const parts = artifact.parts.filter(
          (part: any) => part.type === "text" && part.text
        );
        
        if (parts.length > 0) {
          const artifactText = parts
            .map((part: any) => part.text)
            .join("");
          
          addDebugLog(`Artifact text: "${artifactText.substring(0, 50)}${artifactText.length > 50 ? '...' : ''}"`);
          
          if (artifactText.trim()) {
            // Update response with the artifact content
            setStreamResponse(artifactText);
            
            if (artifact.lastChunk === true) {
              addDebugLog("Last chunk of artifact received");
              setStreamComplete(true);
              setIsStreaming(false);
            }
          } else {
            addDebugLog("Artifact with empty text, ignoring");
          }
        }
      } else {
        addDebugLog("Artifact without text parts");
      }
    }
  };

  // Alternative method using EventSource (now the main method for streaming)
  const sendStreamRequestWithEventSource = async () => {
    if (!agentUrl) {
      toast({
        title: "Agent URL required",
        description: "Please enter the agent URL",
        variant: "destructive",
      });
      return;
    }

    setIsStreaming(true);
    setStreamComplete(false);
    setStreamResponse("");
    setStreamHistory([]);
    setStreamStatus("submitted");
    setDebugLogs([]);
    
    addDebugLog("Starting streaming with EventSource for: " + agentUrl);
    
    try {
      // 1. First make a POST request to start the task
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }
      
      addDebugLog("Sending initial POST request...");
      addDebugLog("Payload: " + JSON.stringify(streamRpcRequest));
      
      // Initial POST request
      const response = await fetch(agentUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(streamRpcRequest),
      });
      
      if (!response.ok) {
        addDebugLog(`HTTP error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        addDebugLog(`Error response: ${errorText}`);
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      // If the response is already streaming SSE, we don't need to create an EventSource
      const contentType = response.headers.get("content-type");
      addDebugLog(`Content type: ${contentType || "Not specified"}`);
      
      if (contentType?.includes("text/event-stream")) {
        addDebugLog("Response is already SSE, processing directly...");
        processEventStream(response);
        return;
      }
      
      let taskData;
      try {
        taskData = await response.json();
        addDebugLog(`Initial response: ${JSON.stringify(taskData).substring(0, 100)}...`);
        
        // Try to get some task ID from the response
        const taskId = extractTaskId(taskData);
        
        if (taskId) {
          addDebugLog(`Task ID: ${taskId}`);
          
          // Check if we need a specific URL for streaming
          // or if we can use the same URL as the task
          let streamUrl = new URL(agentUrl);
          
          // First try to access a dedicated streaming URL
          try {
            // Try some common URL variations for streaming
            // 1. Using the base URL with /stream appended
            streamUrl.pathname = ensureTrailingSlash(streamUrl.pathname) + "stream";
            streamUrl.searchParams.append("taskId", taskId);
            
            if (apiKey) {
              streamUrl.searchParams.append("key", apiKey);
            }
            
            addDebugLog(`Trying streaming URL: ${streamUrl.toString()}`);
            
            // Create EventSource for streaming
            setupEventSource(streamUrl.toString());
          } catch (streamError) {
            addDebugLog(`Streaming URL error: ${streamError}`);
            
            try {
              streamUrl = new URL(agentUrl);
              streamUrl.searchParams.append("stream", "true");
              streamUrl.searchParams.append("taskId", taskId);
              
              if (apiKey) {
                streamUrl.searchParams.append("key", apiKey);
              }
              
              addDebugLog(`Trying alternative URL: ${streamUrl.toString()}`);
              setupEventSource(streamUrl.toString());
            } catch (altError) {
              // If none of the options work, display the initial response
              addDebugLog(`Unable to configure streaming: ${altError}`);
              displayInitialResponse(taskData);
              setIsStreaming(false);
            }
          }
        } else {
          // If there is no ID for streaming, display the initial response
          displayInitialResponse(taskData);
          setIsStreaming(false);
        }
      } catch (jsonError) {
        addDebugLog(`Error processing JSON response: ${jsonError}`);
        setStreamStatus("failed");
        setStreamComplete(true);
        setIsStreaming(false);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      addDebugLog(`Error configuring streaming: ${errorMsg}`);
      console.error("Error configuring streaming:", error);
      
      toast({
        title: "Streaming Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      setIsStreaming(false);
      setStreamComplete(true);
      setStreamStatus("failed");
    }
  };
  
  const ensureTrailingSlash = (path: string) => {
    return path.endsWith('/') ? path : path + '/';
  };
  
  // Function to extract task ID from different response formats
  const extractTaskId = (data: any): string | null => {
    // Try different possible paths for the task ID
    const possiblePaths = [
      data?.result?.id,
      data?.result?.status?.id,
      data?.result?.task?.id,
      data?.id,
      data?.task_id,
      data?.taskId
    ];
    
    for (const path of possiblePaths) {
      if (path && typeof path === 'string') {
        return path;
      }
    }
    
    // If no specific ID is found, try using the request ID as fallback
    return taskId;
  };
  
  // Configure and start the EventSource
  const setupEventSource = (url: string) => {
    addDebugLog(`Configuring EventSource for: ${url}`);
    
    // Ensure any previous EventSource is closed
    let eventSource: EventSource;
    
    try {
      // Create EventSource for streaming
      eventSource = new EventSource(url);
      
      addDebugLog("EventSource created and connecting...");
      
      // For debugging all events
      eventSource.onopen = () => {
        addDebugLog("EventSource connected successfully");
      };
      
      // Process received SSE events
      eventSource.onmessage = (event) => {
        addDebugLog(`Received event [${new Date().toISOString()}]: ${event.data.substring(0, 50)}...`);
        
        try {
          const data = JSON.parse(event.data);
          setStreamHistory(prev => [...prev, event.data]);
          
          // If the event is empty or has no relevant data, ignore it
          if (!data || (!data.result && !data.status && !data.message)) {
            addDebugLog("Event without relevant data");
            return;
          }
          
          // Process data according to the type
          processStreamData(data);
          
        } catch (jsonError) {
          const errorMsg =
            jsonError instanceof Error
              ? jsonError.message
              : "Unknown error";
          addDebugLog(`Error processing JSON: ${errorMsg}`);
          console.error("Error processing JSON:", jsonError);
        }
      };
      
      // Handle errors 
      eventSource.onerror = (error) => {
        addDebugLog(`Error in EventSource: ${JSON.stringify(error)}`);
        console.error("EventSource error:", error);
        
        // Don't close automatically - try to reconnect unless it's a fatal error
        if (eventSource.readyState === EventSource.CLOSED) {
          addDebugLog("EventSource closed due to error");
          toast({
            title: "Streaming Error",
            description: "Connection to server was interrupted",
            variant: "destructive",
          });
          
          setIsStreaming(false);
          setStreamComplete(true);
        } else {
          addDebugLog("EventSource attempting to reconnect...");
        }
      };
      
      const checkStreamStatus = setInterval(() => {
        if (streamComplete) {
          addDebugLog("Stream marked as complete, closing EventSource");
          eventSource.close();
          clearInterval(checkStreamStatus);
        }
      }, 1000);
      
    } catch (esError) {
      addDebugLog(`Error creating EventSource: ${esError}`);
      throw esError;
    }
  };
  
  const displayInitialResponse = (data: any) => {
    addDebugLog("Displaying initial response without streaming");
    
    // Try to extract text message if available
    try {
      const result = data.result || data;
      const status = result.status || {};
      const message = status.message || result.message;
      
      if (message && message.parts) {
        const parts = message.parts.filter((part: any) => part.type === "text");
        
        if (parts.length > 0) {
          const currentText = parts.map((part: any) => part.text).join("");
          setStreamResponse(currentText);
        } else {
          // No text parts, display formatted JSON
          setStreamResponse(JSON.stringify(data, null, 2));
        }
      } else {
        // No structured message, display formatted JSON
        setStreamResponse(JSON.stringify(data, null, 2));
      }
      
      // Set status as completed
      setStreamStatus("completed");
      setStreamComplete(true);
      
    } catch (parseError) {
      // In case of error processing, show raw JSON
      setStreamResponse(JSON.stringify(data, null, 2));
      setStreamStatus("completed");
      setStreamComplete(true);
    } finally {
      setIsStreaming(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  // Render status indicator based on streaming status
  const renderStatusIndicator = () => {
    switch (streamStatus) {
      case "submitted":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Submitted
          </span>
        );
      case "working":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Processing
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      case "canceled":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Canceled
          </span>
        );
      case "input-required":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Input Required
          </span>
        );
      default:
        return null;
    }
  };

  // Typing indicator for streaming
  const renderTypingIndicator = () => {
    if (streamStatus === "working" && !streamComplete) {
      return (
        <div className="flex items-center space-x-1 mt-2 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></div>
          <div
            className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-2">Agent2Agent Protocol</h1>
      <p className="text-gray-400 mb-6">
        Documentation and testing lab for the Agent2Agent protocol
      </p>

      <Tabs
        defaultValue="docs"
        className="w-full mb-8"
        onValueChange={setMainTab}
      >
        <TabsList className="bg-[#222] border-b border-[#333] w-full justify-start mb-6">
          <TabsTrigger
            value="docs"
            className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger
            value="lab"
            className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            A2A Testing Lab
          </TabsTrigger>
          <TabsTrigger
            value="examples"
            className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
          >
            <Code className="h-4 w-4 mr-2" />
            Code Examples
          </TabsTrigger>
        </TabsList>

        {/* Documentation Tab - Only essential technical concepts and details */}
        <TabsContent value="docs">
          <div className="space-y-6">
            <DocumentationSection copyToClipboard={copyToClipboard} />
          </div>
        </TabsContent>

        {/* Lab Tab */}
        <TabsContent value="lab">
          <Card className="bg-[#1a1a1a] border-[#333] text-white mb-6">
            <CardHeader>
              <CardTitle className="text-[#00ff9d]">
                A2A Testing Lab
              </CardTitle>
              <CardDescription>
                Test your A2A agent with different communication methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="http" onValueChange={setLabMode}>
                <TabsList className="bg-[#222] border-[#333] mb-4">
                  <TabsTrigger
                    value="http"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                  >
                    HTTP Request
                  </TabsTrigger>
                  <TabsTrigger
                    value="stream"
                    className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                  >
                    Streaming
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="http">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Agent URL
                        </label>
                        <Input
                          value={agentUrl}
                          onChange={(e) => setAgentUrl(e.target.value)}
                          placeholder="http://localhost:8000/api/v1/a2a/your-agent-id"
                          className="bg-[#222] border-[#444] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          API Key (optional)
                        </label>
                        <Input
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Your API key"
                          className="bg-[#222] border-[#444] text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Message
                      </label>
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
                        <label className="text-sm text-gray-400 mb-1 block">
                          Session ID
                        </label>
                        <Input
                          value={sessionId}
                          onChange={(e) => setSessionId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Task ID
                        </label>
                        <Input
                          value={taskId}
                          onChange={(e) => setTaskId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Call ID
                        </label>
                        <Input
                          value={callId}
                          onChange={(e) => setCallId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                      <Button 
                        onClick={sendRequest}
                        disabled={isLoading}
                        className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] flex-1"
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
                  </div>
                </TabsContent>

                <TabsContent value="stream">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Agent URL
                        </label>
                        <Input
                          value={agentUrl}
                          onChange={(e) => setAgentUrl(e.target.value)}
                          placeholder="http://localhost:8000/api/v1/a2a/your-agent-id"
                          className="bg-[#222] border-[#444] text-white"
                          disabled={isStreaming}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          API Key (optional)
                        </label>
                        <Input
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Your API key"
                          className="bg-[#222] border-[#444] text-white"
                          disabled={isStreaming}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Message
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What is the A2A protocol?"
                        className="bg-[#222] border-[#444] text-white min-h-[100px]"
                        disabled={isStreaming}
                      />
                    </div>

                    <Separator className="my-4 bg-[#333]" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Session ID
                        </label>
                        <Input
                          value={sessionId}
                          onChange={(e) => setSessionId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                          disabled={isStreaming}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Task ID
                        </label>
                        <Input
                          value={taskId}
                          onChange={(e) => setTaskId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                          disabled={isStreaming}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">
                          Call ID
                        </label>
                        <Input
                          value={callId}
                          onChange={(e) => setCallId(e.target.value)}
                          className="bg-[#222] border-[#444] text-white"
                          disabled={isStreaming}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                      <div className="flex-1 flex space-x-2">
                        <Button 
                          onClick={sendStreamRequestWithEventSource}
                          disabled={isStreaming}
                          className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] flex-1"
                        >
                          {isStreaming ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                              Processing Stream...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Send className="mr-2 h-4 w-4" />
                              Start Streaming
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Streaming response area */}
                    {(streamResponse || isStreaming) && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[#00ff9d] font-medium">
                            Real-time Response
                          </h3>
                          <div className="flex items-center space-x-2">
                            {renderStatusIndicator()}
                          </div>
                        </div>

                        <Tabs defaultValue="live" className="w-full">
                          <TabsList className="bg-[#222] border-[#333]">
                            <TabsTrigger
                              value="live"
                              className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                            >
                              View
                            </TabsTrigger>
                            <TabsTrigger
                              value="raw"
                              className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                            >
                              SSE Events
                            </TabsTrigger>
                            <TabsTrigger
                              value="debug"
                              className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]"
                            >
                              Debug
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="live" className="mt-2">
                            <div className="bg-[#222] rounded-md p-4 border border-[#444] min-h-[200px] relative">
                              <div className="prose prose-invert max-w-none">
                                {streamResponse ? (
                                  <div className="whitespace-pre-wrap">
                                    {streamResponse}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 italic">
                                    Waiting for response...
                                  </div>
                                )}
                                {renderTypingIndicator()}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="raw" className="mt-2">
                            <div className="bg-[#222] rounded-md p-4 border border-[#444] max-h-[300px] overflow-y-auto">
                              {streamHistory.length > 0 ? (
                                <div className="space-y-2">
                                  {streamHistory.map((event, idx) => (
                                    <div
                                      key={idx}
                                      className="border-b border-[#333] pb-2 last:border-0"
                                    >
                                      <pre className="text-xs overflow-x-auto">
                                        <code>data: {event}</code>
                                      </pre>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">
                                  No events received yet
                                </div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="debug" className="mt-2">
                            <div className="bg-[#222] rounded-md p-4 border border-[#444] max-h-[300px] overflow-y-auto font-mono text-xs">
                              {debugLogs.length > 0 ? (
                                <div className="space-y-1">
                                  {debugLogs.map((log, idx) => (
                                    <div
                                      key={idx}
                                      className="border-b border-[#333] pb-1 last:border-0"
                                    >
                                      {log}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 italic">
                                  No debug logs available
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {response && labMode === "http" && (
            <Card className="bg-[#1a1a1a] border-[#333] text-white">
              <CardHeader>
                <CardTitle className="text-[#00ff9d]">Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <CodeBlock text={response} language="json" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples">
          <div className="space-y-6">
            <TechnicalDetailsSection copyToClipboard={copyToClipboard} />
            <FrontendImplementationSection copyToClipboard={copyToClipboard} />
            <CodeExamplesSection
              agentUrl={agentUrl}
              apiKey={apiKey}
              jsonRpcRequest={jsonRpcRequest}
              curlExample={curlExample}
              fetchExample={fetchExample}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 bg-[#121212] min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9d]"></div>
        </div>
      }
    >
      <DocumentationContent />
    </Suspense>
  );
}
