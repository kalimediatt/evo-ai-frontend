"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CopyBlock, dracula } from "react-code-blocks";
import { ClipboardCopy, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

function DocumentationContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const agentUrlParam = searchParams.get("agent_url");
  const apiKeyParam = searchParams.get("api_key");

  const [agentUrl, setAgentUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(`session-${Math.random().toString(36).substring(2, 9)}`);
  const [taskId, setTaskId] = useState(`task-${Math.random().toString(36).substring(2, 9)}`);
  const [callId, setCallId] = useState(`call-${Math.random().toString(36).substring(2, 9)}`);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (agentUrlParam) {
      setAgentUrl(agentUrlParam);
    }
    if (apiKeyParam) {
      setApiKey(apiKeyParam);
    }
  }, [agentUrlParam, apiKeyParam]);

  const jsonRpcRequest = {
    jsonrpc: "2.0",
    method: "tasks/send",
    params: {
      message: {
        role: "user",
        parts: [
          {
            type: "text",
            text: message || "What is the A2A protocol?"
          }
        ]
      },
      sessionId: sessionId,
      id: taskId
    },
    id: callId
  };

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
    try {
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(jsonRpcRequest)
      });

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      toast({
        title: "Error sending request",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-6 bg-[#121212] min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">A2A Documentation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader>
            <CardTitle className="text-[#00ff9d]">What is A2A?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Agent2Agent (A2A) is an open protocol created by Google to enable 
              communication and interoperability between agentic applications.
            </p>
            <p>
              This protocol establishes a common standard for agents built 
              in different structures and vendors to collaborate and exchange information.
            </p>
            <div className="flex flex-col space-y-2 mt-4">
              <a 
                href="https://github.com/google/A2A" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00ff9d] hover:underline flex items-center"
              >
                <span className="mr-2">GitHub: google/A2A</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <a 
                href="https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00ff9d] hover:underline flex items-center"
              >
                <span className="mr-2">Google Developers Blog: A2A</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader>
            <CardTitle className="text-[#00ff9d]">JSON-RPC 2.0</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The API uses the JSON-RPC 2.0 protocol for communication with A2A agents.
              A correct JSON-RPC request has the following structure:
            </p>
            <div className="relative">
              <CopyBlock
                text={JSON.stringify({
                  jsonrpc: "2.0",
                  method: "sendTask",
                  params: {
                    message: {
                      role: "user",
                      parts: [
                        {
                          type: "text",
                          text: "Your question here"
                        }
                      ]
                    },
                    sessionId: "abc-123",
                    id: "task-456"
                  },
                  id: "call-789"
                }, null, 2)}
                language="json"
                theme={dracula}
                codeBlock
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-[#333]"
                onClick={() => copyToClipboard(JSON.stringify(jsonRpcRequest, null, 2))}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardHeader>
            <CardTitle className="text-[#00ff9d]">Test your A2A Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {response && (
              <div className="mt-6">
                <h3 className="text-[#00ff9d] mb-2">Agent Response</h3>
                <div className="relative">
                  <CopyBlock
                    text={response}
                    language="json"
                    theme={dracula}
                    codeBlock
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                    onClick={() => copyToClipboard(response)}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="curl" className="w-full mb-8">
        <TabsList className="bg-[#222] border-b border-[#333] w-full justify-start">
          <TabsTrigger value="curl" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
            cURL
          </TabsTrigger>
          <TabsTrigger value="fetch" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
            JavaScript/Fetch
          </TabsTrigger>
          <TabsTrigger value="response" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
            Response Format
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="curl" className="mt-4">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6 relative">
              <CopyBlock
                text={curlExample}
                language="bash"
                theme={dracula}
                codeBlock
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-6 right-4 text-white hover:bg-[#333]"
                onClick={() => copyToClipboard(curlExample)}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fetch" className="mt-4">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6 relative">
              <CopyBlock
                text={fetchExample}
                language="javascript"
                theme={dracula}
                codeBlock
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-6 right-4 text-white hover:bg-[#333]"
                onClick={() => copyToClipboard(fetchExample)}
              >
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="response" className="mt-4">
          <Card className="bg-[#1a1a1a] border-[#333]">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="text-[#00ff9d] mb-2">Successful Response</h3>
                <div className="relative">
                  <CopyBlock
                    text={JSON.stringify({
                      jsonrpc: "2.0",
                      result: {
                        status: {
                          message: {
                            parts: [
                              {
                                type: "text",
                                text: "Agent response here..."
                              }
                            ]
                          }
                        }
                      },
                      id: "call-789"
                    }, null, 2)}
                    language="json"
                    theme={dracula}
                    codeBlock
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                    onClick={() => copyToClipboard(JSON.stringify({
                      jsonrpc: "2.0",
                      result: {
                        status: {
                          message: {
                            parts: [
                              {
                                type: "text",
                                text: "Agent response here..."
                              }
                            ]
                          }
                        }
                      },
                      id: "call-789"
                    }, null, 2))}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-[#00ff9d] mb-2">Error Response</h3>
                <div className="relative">
                  <CopyBlock
                    text={JSON.stringify({
                      jsonrpc: "2.0",
                      error: {
                        code: -32603,
                        message: "Error message"
                      },
                      id: "call-789"
                    }, null, 2)}
                    language="json"
                    theme={dracula}
                    codeBlock
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-[#333]"
                    onClick={() => copyToClipboard(JSON.stringify({
                      jsonrpc: "2.0",
                      error: {
                        code: -32603,
                        message: "Error message"
                      },
                      id: "call-789"
                    }, null, 2))}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-[#1a1a1a] border-[#333] text-white">
        <CardHeader>
          <CardTitle className="text-[#00ff9d]">JSON-RPC 2.0 Specification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-white">Required fields:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="bg-[#333] px-1 rounded">jsonrpc</code>: Protocol version (always "2.0")</li>
              <li><code className="bg-[#333] px-1 rounded">method</code>: Method to be called (ex: "sendTask")</li>
              <li><code className="bg-[#333] px-1 rounded">params</code>: Call parameters</li>
              <li><code className="bg-[#333] px-1 rounded">id</code>: Unique identifier of the call (can be string or number)</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-white">Important notes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The request ID will be returned in the response (important for correlation)</li>
              <li>The message format follows the Google A2A protocol</li>
              <li>Agents may support different resources, check the Agent Card for more details</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DocumentationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6 bg-[#121212] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ff9d]"></div>
    </div>}>
      <DocumentationContent />
    </Suspense>
  );
} 