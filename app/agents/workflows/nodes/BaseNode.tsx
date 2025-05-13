/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/workflows/nodes/BaseNode.tsx                              │
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
