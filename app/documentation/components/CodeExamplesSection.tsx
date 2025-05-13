/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/documentation/components/CodeExamplesSection.tsx                 │
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/app/documentation/components/CodeBlock";

interface CodeExamplesSectionProps {
  agentUrl: string;
  apiKey: string;
  jsonRpcRequest: any;
  curlExample: string;
  fetchExample: string;
}

export function CodeExamplesSection({
  agentUrl,
  apiKey,
  jsonRpcRequest,
  curlExample,
  fetchExample
}: CodeExamplesSectionProps) {
  const pythonExample = `import requests
import json

def test_a2a_agent():
    url = "${agentUrl || "http://localhost:8000/api/v1/a2a/your-agent-id"}"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "${apiKey || "your-api-key"}"
    }
    
    payload = ${JSON.stringify(jsonRpcRequest, null, 2)}
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    print("Agent response:", data)
    
    return data

if __name__ == "__main__":
    test_a2a_agent()`;

  return (
    <Card className="bg-[#1a1a1a] border-[#333] text-white">
      <CardHeader>
        <CardTitle className="text-[#00ff9d]">Code Examples</CardTitle>
        <CardDescription className="text-gray-400">
          Code snippets ready to use with A2A agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl">
          <TabsList className="bg-[#222] border-[#333] mb-4">
            <TabsTrigger value="curl" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              cURL
            </TabsTrigger>
            <TabsTrigger value="javascript" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="python" className="data-[state=active]:bg-[#333] data-[state=active]:text-[#00ff9d]">
              Python
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="curl" className="relative">
            <CodeBlock
              text={curlExample}
              language="bash"
            />
          </TabsContent>
          
          <TabsContent value="javascript" className="relative">
            <CodeBlock
              text={fetchExample}
              language="javascript"
            />
          </TabsContent>
          
          <TabsContent value="python" className="relative">
            <CodeBlock
              text={pythonExample}
              language="python"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}