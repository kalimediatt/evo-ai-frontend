import type { NodeTypes, BuiltInNode, Node } from "@xyflow/react";

import { ConditionNode } from "./components/condition/ConditionNode";
import { AgentNode } from "./components/agent/AgentNode";
import { StartNode, StartNodeType } from "./components/start/StartNode";

import "./style.css";
import {
  ConditionType,
} from "./nodeFunctions";
import { Agent } from "@/types/agent";

type AgentNodeType = Node<
  {
    label?: string;
    agent?: Agent;
  },
  "agent-node"
>;

type ConditionNodeType = Node<
  {
    label?: string;
    integration?: string;
    icon?: string;
    conditions?: ConditionType[];
  },
  "condition-node"
>;

export type AppNode =
  | BuiltInNode
  | StartNodeType
  | AgentNodeType
  | ConditionNodeType;

export type NodeType = AppNode["type"];

export const initialNodes: AppNode[] = [
  {
    id: "start-node",
    type: "start-node",
    position: { x: -100, y: 100 },
    data: {
      label: "Início",
    },
  },
];

export const nodeTypes = {
  "start-node": StartNode,
  "agent-node": AgentNode,
  "condition-node": ConditionNode,
} satisfies NodeTypes;
