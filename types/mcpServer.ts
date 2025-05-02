export interface ToolConfig {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export interface MCPServer {
  id: string;
  name: string;
  description?: string;
  config_type: string;
  config_json: Record<string, any>;
  environments: Record<string, any>;
  tools: ToolConfig[];
  type: string;
  created_at: string;
  updated_at?: string;
}

export interface MCPServerCreate {
  name: string;
  description?: string;
  config_type?: string;
  config_json?: Record<string, any>;
  environments?: Record<string, any>;
  tools?: ToolConfig[];
  type?: string;
} 