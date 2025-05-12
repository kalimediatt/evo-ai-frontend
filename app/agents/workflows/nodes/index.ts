import type { NodeTypes, BuiltInNode, Node } from "@xyflow/react";

import { ConditionNode } from "./components/condition/ConditionNode";
import { AgentNode } from "./components/agent/AgentNode";
import { StartNode, StartNodeType } from "./components/start/StartNode";
import { MessageNode } from "./components/message/MessageNode";

import "./style.css";
import {
  ConditionType,
  MessageType,
} from "./nodeFunctions";
import { Agent } from "@/types/agent";

type AgentNodeType = Node<
  {
    label?: string;
    agent?: Agent;
  },
  "agent-node"
>;

type MessageNodeType = Node<
  {
    label?: string;
    message?: MessageType;
  },
  "message-node"
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
  | ConditionNodeType
  | MessageNodeType;

export type NodeType = AppNode["type"];

export const initialNodes: AppNode[] = [
  {
    id: "start-node",
    type: "start-node",
    position: { x: -100, y: 100 },
    data: {
      label: "Start",
    },
  },
];

export const nodeTypes = {
  "start-node": StartNode,
  "agent-node": AgentNode,
  "message-node": MessageNode,
  "condition-node": ConditionNode,
} satisfies NodeTypes;
