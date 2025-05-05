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

// Gerar um contact_id baseado na data/hora atual
export const generateContactId = () => {
  const now = new Date();
  // Formato: YYYYMMDD_HHMMSS (sem caracteres especiais ou espaços)
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
};

// Listar todas as sessões de um cliente
export const listSessions = (clientId: string) =>
  api.get<ChatSession[]>(`/api/v1/sessions/client/${clientId}`);

// Obter mensagens de uma sessão específica
export const getSessionMessages = (sessionId: string) =>
  api.get<ChatMessage[]>(`/api/v1/sessions/${sessionId}/messages`);

// Criar uma nova sessão de chat
export const createSession = (clientId: string, agentId: string) => {
  const contactId = generateContactId();
  const sessionId = `${contactId}_${agentId}`;
  
  return api.post<ChatSession>(`/api/v1/sessions/`, {
    id: sessionId,
    client_id: clientId,
    agent_id: agentId,
  });
};

export const deleteSession = (sessionId: string) => {
  return api.delete<ChatSession>(`/api/v1/sessions/${sessionId}`);
};

// Enviar uma mensagem para uma sessão
export const sendMessage = (sessionId: string, agentId: string, message: string) => {
  // Extrair o contact_id do session_id (formato é contactId_agentId)
  const contactId = sessionId.split('_')[0];
  
  return api.post<ChatMessage>(`/api/v1/chat`, {
    agent_id: agentId,
    contact_id: contactId,
    message: message
  });
}; 