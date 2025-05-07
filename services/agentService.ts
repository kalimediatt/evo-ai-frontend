import api from "./api";
import { Agent, AgentCreate } from "../types/agent";

export const createAgent = (data: AgentCreate) =>
  api.post<Agent>("/api/v1/agents/", data);

export const listAgents = (clientId: string, skip = 0, limit = 100, folderId?: string) => {
  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  
  if (folderId) {
    queryParams.append("folder_id", folderId);
  }
  
  return api.get<Agent[]>(`/api/v1/agents/?${queryParams.toString()}`, {
    headers: { "x-client-id": clientId },
  });
};

export const getAgent = (agentId: string, clientId: string) =>
  api.get<Agent>(`/api/v1/agents/${agentId}`, {
    headers: { "x-client-id": clientId },
  });

export const updateAgent = (agentId: string, data: Partial<AgentCreate>) =>
  api.put<Agent>(`/api/v1/agents/${agentId}`, data);

export const deleteAgent = (agentId: string) =>
  api.delete(`/api/v1/agents/${agentId}`);

// Novas funções para o sistema de pastas

export interface Folder {
  id: string;
  name: string;
  description: string;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface FolderCreate {
  name: string;
  description: string;
  client_id: string;
}

export interface FolderUpdate {
  name?: string;
  description?: string;
}

// Criar nova pasta
export const createFolder = (data: FolderCreate) =>
  api.post<Folder>("/api/v1/agents/folders", data);

// Listar pastas do cliente
export const listFolders = (clientId: string, skip = 0, limit = 100) =>
  api.get<Folder[]>(`/api/v1/agents/folders?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId },
  });

// Obter detalhes da pasta
export const getFolder = (folderId: string, clientId: string) =>
  api.get<Folder>(`/api/v1/agents/folders/${folderId}`, {
    headers: { "x-client-id": clientId },
  });

// Atualizar pasta
export const updateFolder = (folderId: string, data: FolderUpdate, clientId: string) =>
  api.put<Folder>(`/api/v1/agents/folders/${folderId}`, data, {
    headers: { "x-client-id": clientId },
  });

// Excluir pasta
export const deleteFolder = (folderId: string, clientId: string) =>
  api.delete(`/api/v1/agents/folders/${folderId}`, {
    headers: { "x-client-id": clientId },
  });

// Listar agentes da pasta
export const listAgentsInFolder = (folderId: string, clientId: string, skip = 0, limit = 100) =>
  api.get<Agent[]>(`/api/v1/agents/folders/${folderId}/agents?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId },
  });

// Atribuir/remover agente da pasta
export const assignAgentToFolder = (agentId: string, folderId: string | null, clientId: string) => {
  const url = folderId
    ? `/api/v1/agents/${agentId}/folder?folder_id=${folderId}`
    : `/api/v1/agents/${agentId}/folder`;
  
  return api.put<Agent>(url, {}, {
    headers: { "x-client-id": clientId },
  });
};

// API Key Interfaces e Serviços

export interface ApiKey {
  id: string;
  name: string;
  provider: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ApiKeyCreate {
  name: string;
  provider: string;
  client_id: string;
  key_value: string;
}

export interface ApiKeyUpdate {
  name?: string;
  provider?: string;
  key_value?: string;
  is_active?: boolean;
}

// Criar nova chave API
export const createApiKey = (data: ApiKeyCreate) =>
  api.post<ApiKey>("/api/v1/agents/apikeys", data);

// Listar todas as chaves API do cliente
export const listApiKeys = (clientId: string, skip = 0, limit = 100) =>
  api.get<ApiKey[]>(`/api/v1/agents/apikeys?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId },
  });

// Obter detalhes de uma chave API
export const getApiKey = (keyId: string, clientId: string) =>
  api.get<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, {
    headers: { "x-client-id": clientId },
  });

// Atualizar uma chave API
export const updateApiKey = (keyId: string, data: ApiKeyUpdate, clientId: string) =>
  api.put<ApiKey>(`/api/v1/agents/apikeys/${keyId}`, data, {
    headers: { "x-client-id": clientId },
  });

// Desativar uma chave API (soft delete)
export const deleteApiKey = (keyId: string, clientId: string) =>
  api.delete(`/api/v1/agents/apikeys/${keyId}`, {
    headers: { "x-client-id": clientId },
  }); 