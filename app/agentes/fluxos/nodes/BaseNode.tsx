import { Handle, Position } from "@xyflow/react";
import React from "react";

import { useDnD } from "@/contexts/DnDContext";

export function BaseNode({
  selected,
  hasTarget,
  children,
}: {
  selected: boolean;
  hasTarget: boolean;
  children: React.ReactNode;
}) {
  const { pointerEvents } = useDnD();

  return (
    <>
      <div
        className={`relative z-0 w-[350px] rounded-2xl p-4 shadow-md border border-gray-700 bg-gray-800 ${
          selected
            ? "border-2 border-green-500"
            : "border-2 hover:border-2 border-gray-700 hover:border-blue-500"
        }`}
        style={{
          backgroundColor: "#2c2c2da8",
        }}
      >
        {hasTarget && (
          <Handle
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "100%",
              borderRadius: "15px",
              height: "100%",
              backgroundColor: "transparent",
              border: "none",
              pointerEvents: pointerEvents === "none" ? "none" : "auto",
            }}
            type="target"
            position={Position.Left}
          />
        )}

        {children}
      </div>
    </>
  );
}
