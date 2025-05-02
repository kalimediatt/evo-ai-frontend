import api from "./api";
import { Agent, AgentCreate } from "../types/agent";

export const createAgent = (data: AgentCreate) =>
  api.post<Agent>("/api/v1/agents/", data);

export const listAgents = (clientId: string, skip = 0, limit = 100) =>
  api.get<Agent[]>(`/api/v1/agents/?skip=${skip}&limit=${limit}`, {
    headers: { "x-client-id": clientId },
  });

export const getAgent = (agentId: string, clientId: string) =>
  api.get<Agent>(`/api/v1/agents/${agentId}`, {
    headers: { "x-client-id": clientId },
  });

export const updateAgent = (agentId: string, data: Partial<AgentCreate>) =>
  api.put<Agent>(`/api/v1/agents/${agentId}`, data);

export const deleteAgent = (agentId: string) =>
  api.delete(`/api/v1/agents/${agentId}`); 