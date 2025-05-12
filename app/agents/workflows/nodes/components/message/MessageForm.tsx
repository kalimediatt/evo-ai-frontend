/* eslint-disable jsx-a11y/alt-text */
import { useEdges, useNodes } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "@/types/agent";
import { listAgents } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */
function MessageForm({
  selectedNode,
  handleUpdateNode,
  setEdges,
  setIsOpen,
  setSelectedNode,
}: {
  selectedNode: any;
  handleUpdateNode: any;
  setEdges: any;
  setIsOpen: any;
  setSelectedNode: any;
}) {
  const [node, setNode] = useState(selectedNode);
  const [messageType, setMessageType] = useState("text");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const edges = useEdges();
  const nodes = useNodes();

  const connectedNode = useMemo(() => {
    const edge = edges.find((edge) => edge.source === selectedNode.id);
    if (!edge) return null;
    const node = nodes.find((node) => node.id === edge.target);
    return node || null;
  }, [edges, nodes, selectedNode.id]);
  
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {};
  const clientId = user?.client_id || "";
  
  const currentAgent = typeof window !== "undefined" ? 
    JSON.parse(localStorage.getItem("current_workflow_agent") || '{}') : {};
  const currentAgentId = currentAgent?.id;

  useEffect(() => {
    if (selectedNode) {
      setNode(selectedNode);
      setMessageType(selectedNode.data.message?.type || "text");
      setContent(selectedNode.data.message?.content || "");
    }
  }, [selectedNode]);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    listAgents(clientId)
      .then((res) => {
        const filteredAgents = res.data.filter((agent: Agent) => agent.id !== currentAgentId);
        setAllAgents(filteredAgents);
        setAgents(filteredAgents);
      })
      .catch((error) => console.error("Error loading agents:", error))
      .finally(() => setLoading(false));
  }, [clientId, currentAgentId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setAgents(allAgents);
    } else {
      const filtered = allAgents.filter((agent) => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setAgents(filtered);
    }
  }, [searchTerm, allAgents]);

  const handleDeleteEdge = useCallback(() => {
    const id = edges.find((edge: any) => edge.source === selectedNode.id)?.id;
    setEdges((edges: any) => {
      const left = edges.filter((edge: any) => edge.id !== id);
      return left;
    });
  }, [nodes, edges, selectedNode, setEdges]);

  const handleSelectAgent = (agent: Agent) => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        agent,
      },
    };
    setNode(updatedNode);
    handleUpdateNode(updatedNode);
  };

  const getAgentTypeName = (type: string) => {
    const agentTypes: Record<string, string> = {
      llm: "LLM Agent",
      a2a: "A2A Agent",
      sequential: "Sequential Agent",
      parallel: "Parallel Agent",
      loop: "Loop Agent",
    };
    return agentTypes[type] || type;
  };

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        message: {
          type: messageType,
          content,
        },
      },
    };
    setNode(updatedNode);
    handleUpdateNode(updatedNode);
  };

  const renderForm = () => {
    return (
      <div className="pb-4 pl-8 pr-8 pt-2 text-white">
        <h3 className="text-lg font-medium mb-4">Configure Message</h3>
        <div className="mb-4">
          <label className="block text-sm mb-2">Type</label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-gray-200 rounded-md px-3 py-2"
          >
            <option value="text">Text</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-gray-200 rounded-md px-3 py-2 min-h-[80px]"
            placeholder="Type your message here..."
          />
        </div>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSave}
        >
          Save Message
        </Button>
      </div>
    );
  };

  return renderForm();
}

export { MessageForm };
