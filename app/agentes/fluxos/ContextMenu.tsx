import { useReactFlow, Node, Edge } from "@xyflow/react";
import { Copy, Trash2 } from "lucide-react";
import React, { useCallback } from "react";

interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
}

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) {
  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();

  const duplicateNode = useCallback(() => {
    const node = getNode(id);

    if (!node) {
      console.error(`Node with id ${id} not found.`);
      return;
    }

    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNodes({
      ...node,
      id: `${node.id}-copy`,
      position,
      selected: false,
      dragging: false,
    });
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes: Node[]) => nodes.filter((node) => node.id !== id));
    setEdges((edges: Edge[]) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id),
    );
  }, [id, setNodes, setEdges]);

  return (
    <div
      style={{
        position: "absolute",
        top: top !== undefined ? `${top}px` : undefined,
        left: left !== undefined ? `${left}px` : undefined,
        right: right !== undefined ? `${right}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
        zIndex: 10,
      }}
      className="context-menu rounded-md border p-3 shadow-lg border-gray-700 bg-gray-800"
      {...props}
    >
      <p className="mb-2 text-sm font-semibold text-gray-200">
        Ações
      </p>
      <button
        onClick={duplicateNode}
        className="mb-1 flex w-full flex-row items-center rounded-md px-2 py-1 text-sm hover:bg-gray-700"
      >
        <Copy
          size={16}
          className="mr-2 flex-shrink-0 text-blue-300"
        />
        <span className="text-gray-300">Duplicar</span>
      </button>
      <button
        onClick={deleteNode}
        className="flex w-full flex-row items-center rounded-md px-2 py-1 text-sm hover:bg-gray-700"
      >
        <Trash2
          size={16}
          className="mr-2 flex-shrink-0 text-red-300"
        />
        <span className="text-gray-300">Excluir</span>
      </button>
    </div>
  );
}
