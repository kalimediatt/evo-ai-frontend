/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: A2AAgentConfig.tsx                                                    │
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
    (edge) => edge.source === props.id
  );

  return (
    <BaseNode hasTarget={true} selected={selected || false}>
      <div className="mb-4 flex items-center gap-2">
        <Zap size={20} className="text-gray-400" />
        <span className="font-semibold text-gray-300">Start</span>
      </div>

      <div className="text-sm text-gray-400">Input: User content</div>

      <div className="mt-4 cursor-pointer text-right text-sm text-gray-400">
        Then
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
