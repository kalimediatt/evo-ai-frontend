/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, NodeProps, Position, useEdges } from "@xyflow/react";
import { MessageCircle, User } from "lucide-react";
import { MessageType } from "../../nodeFunctions";

import { BaseNode } from "../../BaseNode";

export function MessageNode(props: NodeProps) {
  const { selected, data } = props;

  const edges = useEdges();

  const isHandleConnected = (handleId: string) => {
    return edges.some(
      (edge) => edge.source === props.id && edge.sourceHandle === handleId
    );
  };

  const isBottomHandleConnected = isHandleConnected("bottom-handle");
  
  const message = data.message as MessageType | undefined;

  return (
    <BaseNode hasTarget={true} selected={selected || false}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-gray-500 dark:text-gray-400" />
          <div>
            <p className="text-md font-medium text-black dark:text-white">
              {data.label as string}
            </p>
          </div>
        </div>
        <MessageCircle size={20} className="text-blue-500" />{" "}
      </div>

      <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 bg-white dark:bg-transparent">
        {message ? (
          <div className="flex flex-col items-center">
            <p className="font-medium text-black dark:text-white">{message.type === "text" ? "Text Message" : message.type}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{message.content}</p>
          </div>
        ) : (
          "No message configured"
        )}
      </div>

      <div className="mt-4 cursor-pointer text-right text-sm text-gray-500 dark:text-gray-400">
        Next step
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
