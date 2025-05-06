"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Canva from "./Canva";
import { Agent } from '@/types/agent';
import { getAgent, updateAgent } from '@/services/agentService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download } from 'lucide-react';
import Link from 'next/link';
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "@/contexts/DnDContext";
import { NodeDataProvider } from "@/contexts/NodeDataContext";
import { SourceClickProvider } from "@/contexts/SourceClickContext";
import { useToast } from '@/components/ui/use-toast';

export default function FluxosPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const canvaRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Buscar client_id do usuário logado
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || '{}') : {};
  const clientId = user?.client_id || "";

  useEffect(() => {
    if (agentId && clientId) {
      setLoading(true);
      getAgent(agentId, clientId)
        .then(res => {
          setAgent(res.data);
          // Salvar o agente atual no localStorage para poder filtrá-lo na lista de agentes
          if (typeof window !== "undefined") {
            localStorage.setItem("current_workflow_agent", JSON.stringify(res.data));
          }
        })
        .catch(err => {
          console.error("Erro ao carregar agente:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [agentId, clientId]);

  // Limpar o agente do localStorage quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("current_workflow_agent");
      }
    };
  }, []);

  const handleExportFlow = () => {
    if (!canvaRef.current) return;
    
    const { nodes, edges } = canvaRef.current.getFlowData();
    
    const flowData = {
      nodes,
      edges,
    };

    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `flow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveWorkflow = async () => {
    if (!agent || !canvaRef.current) return;
    
    try {
      const { nodes, edges } = canvaRef.current.getFlowData();
      
      const workflow = {
        nodes,
        edges
      };
      
      await updateAgent(agent.id, {
        ...agent,
        config: {
          ...agent.config,
          workflow
        }
      });
      
      toast({
        title: "Workflow salvo",
        description: "As alterações foram salvas com sucesso",
      });
      
      canvaRef.current.setHasChanges(false);
    } catch (error) {
      console.error("Erro ao salvar workflow:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 bg-[#121212] min-h-screen rounded-lg flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Link href="/agentes">
          <Button variant="outline" className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Agentes
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
          onClick={handleSaveWorkflow}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
        
        <Button 
          variant="outline" 
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
          onClick={handleExportFlow}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
      {agent && <div className="absolute top-4 right-4 z-10 bg-gray-800 px-4 py-2 rounded-md">
        <h2 className="text-gray-200 font-medium">{agent.name}</h2>
        <p className="text-gray-400 text-sm">{agent.type}</p>
      </div>}
      <NodeDataProvider>
        <SourceClickProvider>
          <DnDProvider>
            <ReactFlowProvider>
              <Canva agent={agent} ref={canvaRef} />
            </ReactFlowProvider>
          </DnDProvider>
        </SourceClickProvider>
      </NodeDataProvider>
    </div>
  );
}
