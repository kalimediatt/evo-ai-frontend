/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Node, NodeProps, Position, useEdges } from "@xyflow/react";
import { Zap } from "lucide-react";

import { BaseNode } from "../../BaseNode";

export type StartNodeType = Node<
  {
    label?: string;
  },
  "start-node"
>;

export function StartNode(props: NodeProps) {
  const { selected, data } = props;
  const edges = useEdges();

  const isSourceHandleConnected = edges.some(
    (edge) => edge.source === props.id,
  );

  return (
    <BaseNode hasTarget={true} selected={selected || false}>
      <div className="mb-4 flex items-center gap-2">
        <Zap size={20} className="text-gray-400" />
        <span className="font-semibold text-gray-300">
          Início
        </span>
      </div>

      <div className="mt-4 cursor-pointer text-right text-sm text-gray-400">
        Então
      </div>

      <Handle
        style={{
          borderRadius: "50%",
          height: "16px",
          position: "absolute",
          width: "16px",
          right: "0px",
          top: "calc(100% - 25px)",
          backgroundColor: isSourceHandleConnected ? "#8492A6" : "#f5f5f5",
          border: "3px solid #8492A6",
        }}
        type="source"
        position={Position.Right}
      />
    </BaseNode>
  );
}
