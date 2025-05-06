/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, NodeProps, Position, useEdges } from "@xyflow/react";
import { MessageCircle, User } from "lucide-react";
import { Agent } from "@/types/agent";

import { BaseNode } from "../../BaseNode";

export function AgentNode(props: NodeProps) {
  const { selected, data } = props;

  const edges = useEdges();

  const isHandleConnected = (handleId: string) => {
    return edges.some(
      (edge) => edge.source === props.id && edge.sourceHandle === handleId
    );
  };

  const isBottomHandleConnected = isHandleConnected("bottom-handle");
  
  // Garantir que o agente existe e é do tipo Agent
  const agent = data.agent as Agent | undefined;

  return (
    <BaseNode hasTarget={true} selected={selected || false}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={20} className="text-gray-500 dark:text-gray-400" />
          <div>
            <p className="text-md font-medium text-black dark:text-white">
              {data.label as string}
            </p>
          </div>
        </div>
        <MessageCircle size={20} className="text-blue-500" />{" "}
      </div>

      <div className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700">
        {agent ? (
          <div className="flex flex-col items-center">
            <p className="font-medium text-black dark:text-white">{agent.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{agent.type}</p>
          </div>
        ) : (
          "Selecionar agente"
        )}
      </div>

      <div className="mt-4 cursor-pointer text-right text-sm text-gray-500 dark:text-gray-400">
        Próximo passo
      </div>
      <Handle
        style={{
          borderRadius: "50%",
          height: "16px",
          position: "absolute",
          width: "16px",
          right: "0px",
          top: "calc(100% - 25px)",
          backgroundColor: isBottomHandleConnected ? "#8492A6" : "#f5f5f5",
          border: "3px solid #8492A6",
        }}
        type="source"
        position={Position.Right}
        id="bottom-handle"
      />
    </BaseNode>
  );
}
