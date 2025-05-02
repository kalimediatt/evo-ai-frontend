import { MCPServer } from '@/types/mcpServer';

export type AgentType = "llm" | "a2a" | "sequential" | "parallel" | "loop";

export interface ToolConfig {
  id: string;
  envs: Record<string, string>;
}

export interface MCPServerConfig {
  id: string;
  envs: Record<string, string>;
  tools: string[];
  selected_tools?: string[]; // Para uso na UI
}

export interface HTTPToolParameter {
  type: string;
  required: boolean;
  description: string;
}

export interface HTTPToolParameters {
  path_params?: Record<string, string>;
  query_params?: Record<string, string | string[]>;
  body_params?: Record<string, HTTPToolParameter>;
}

export interface HTTPToolErrorHandling {
  timeout: number;
  retry_count: number;
  fallback_response: Record<string, string>;
}

export interface HTTPTool {
  name: string;
  method: string;
  values: Record<string, string>;
  headers: Record<string, string>;
  endpoint: string;
  parameters: HTTPToolParameters;
  description: string;
  error_handling: HTTPToolErrorHandling;
}

export interface CustomTools {
  http_tools: HTTPTool[];
}

// Uma configuração unificada para todos os tipos de agentes
export interface AgentConfig {
  // LLM config
  api_key?: string;
  tools?: ToolConfig[];
  custom_tools?: CustomTools;
  mcp_servers?: MCPServerConfig[];
  
  // Sequential, Parallel e Loop config
  sub_agents?: string[];
  
  // Loop config específico
  max_iterations?: number;
  condition?: string;
}

export interface Agent {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  type: AgentType;
  model?: string;
  api_key?: string;
  instruction?: string;
  agent_card_url?: string;
  config?: AgentConfig;
  created_at: string;
  updated_at?: string;
}

export interface AgentCreate {
  client_id: string;
  name: string;
  description?: string;
  type: AgentType;
  model?: string;
  api_key?: string;
  instruction?: string;
  agent_card_url?: string;
  config?: AgentConfig;
} 