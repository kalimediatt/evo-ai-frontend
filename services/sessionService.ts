import api from "./api";

export interface ChatSession {
  id: string;
  app_name: string;
  user_id: string;
  state: Record<string, any>;
  events: any[];
  last_update_time: number;
  update_time: string;
  create_time: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  content: {
    parts: Array<{
      text?: string;
      functionCall?: any;
      functionResponse?: any;
      function_call?: {
        id: string;
        name: string;
        args?: Record<string, any>;
      };
      function_response?: {
        id: string;
        name: string;
        response: {
          status: string;
          error_message?: string;
          [key: string]: any;
        };
      };
      [key: string]: any;
    }>;
    role: string;
  };
  author: string;
  timestamp: number;
  [key: string]: any;
}

export const generateExternalId = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

export const listSessions = (clientId: string) =>
  api.get<ChatSession[]>(`/api/v1/sessions/client/${clientId}`);

export const getSessionMessages = (sessionId: string) =>
  api.get<ChatMessage[]>(`/api/v1/sessions/${sessionId}/messages`);

export const createSession = (clientId: string, agentId: string) => {
  const externalId = generateExternalId();
  const sessionId = `${externalId}_${agentId}`;
  
  return api.post<ChatSession>(`/api/v1/sessions/`, {
    id: sessionId,
    client_id: clientId,
    agent_id: agentId,
  });
};

export const deleteSession = (sessionId: string) => {
  return api.delete<ChatSession>(`/api/v1/sessions/${sessionId}`);
};

export const sendMessage = (sessionId: string, agentId: string, message: string) => {
  const externalId = sessionId.split('_')[0];
  
  return api.post<ChatMessage>(`/api/v1/chat`, {
    agent_id: agentId,
    external_id: externalId,
    message: message
  });
}; 