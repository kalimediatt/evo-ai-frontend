"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAgents } from "@/services/agentService";
import {
  listSessions,
  getSessionMessages,
  sendMessage,
  generateExternalId,
  ChatSession,
  ChatMessage,
  deleteSession,
} from "@/services/sessionService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";

// Adicionar a interface para o tipo de retorno da função getMessageText
interface FunctionMessageContent {
  title: string;
  content: string;
  author?: string;
}

export default function Chat() {
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [showAgentFilter, setShowAgentFilter] = useState(false);
  const [expandedFunctions, setExpandedFunctions] = useState<
    Record<string, boolean>
  >({});
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Buscar ID do cliente do localStorage
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const clientId = user?.client_id || "teste"; // Fallback para teste

  // Função para rolar para o final do chat
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Carregar agentes e sessões ao iniciar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar agentes
        const agentsResponse = await listAgents(clientId);
        setAgents(agentsResponse.data);

        // Carregar sessões
        const sessionsResponse = await listSessions(clientId);
        setSessions(sessionsResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // Carregar mensagens quando uma sessão é selecionada
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await getSessionMessages(selectedSession);
        setMessages(response.data);

        // Extrair o ID do agente do ID da sessão
        const agentId = selectedSession.split("_")[1];
        setCurrentAgentId(agentId);

        // Rolar para o final após carregar mensagens
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedSession]);

  // Efeito para rolar para o final quando as mensagens mudarem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  // Filtrar sessões por termo de busca e agente selecionado
  const filteredSessions = sessions.filter((session) => {
    const matchesSearchTerm = session.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Se o filtro de agente for "all", retorna todas as sessões que correspondem ao termo de busca
    if (selectedAgentFilter === "all") {
      return matchesSearchTerm;
    }

    // Caso contrário, filtra também pelo agente selecionado
    const sessionAgentId = session.id.split("_")[1];
    return matchesSearchTerm && sessionAgentId === selectedAgentFilter;
  });

  // Ordenar por data de atualização (mais recentes primeiro)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // Usar campo update_time para ordenação
    const updateTimeA = new Date(a.update_time).getTime();
    const updateTimeB = new Date(b.update_time).getTime();

    return updateTimeB - updateTimeA;
  });

  // Função para formatar a data/hora
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);

      // Formatar como "DD/MM/YYYY HH:MM"
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return "Data inválida";
    }
  };

  // Filtrar agentes por termo de busca
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
      (agent.description &&
        agent.description.toLowerCase().includes(agentSearchTerm.toLowerCase()))
  );

  // Selecionar agente para nova conversa
  const selectAgent = (agentId: string) => {
    setCurrentAgentId(agentId);
    setSelectedSession(null); // Limpar sessão atual
    setMessages([]); // Limpar mensagens
    setIsNewChatDialogOpen(false); // Fechar diálogo
  };

  // Enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !currentAgentId) return;

    let sessionId = selectedSession;
    let responseData = null;

    try {
      setIsSending(true);

      // Se não houver sessão selecionada, criar uma nova sessão implicitamente
      if (!selectedSession) {
        const externalId = generateExternalId();
        // Formato simplificado: externalId_agentId (sem timestamp)
        const newSessionId = `${externalId}_${currentAgentId}`;
        setSelectedSession(newSessionId);
        sessionId = newSessionId;
      }

      // Adicionar mensagem localmente para feedback imediato
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: {
          parts: [{ text: messageInput }],
          role: "user",
        },
        author: "user",
        timestamp: Date.now() / 1000,
      };

      setMessages((prev) => [...prev, tempMessage]);
      // Rolar para o final após adicionar mensagem
      setTimeout(scrollToBottom, 100);

      // Verificar se sessionId existe antes de chamar a API
      if (!sessionId) {
        throw new Error("ID da sessão não definido");
      }

      // Enviar para a API
      const response = await sendMessage(
        sessionId,
        currentAgentId,
        messageInput
      );
      
      responseData = response.data;

      // Atualizar a lista de sessões
      const sessionsResponse = await listSessions(clientId);
      setSessions(sessionsResponse.data);
      
      // Limpar input
      setMessageInput("");
      
      // Resetar altura do textarea
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      // Verificar se a API retornou um ID de sessão válido
      if (responseData && responseData.session_id) {
        sessionId = responseData.session_id;
        // Atualizar o ID da sessão selecionada
        setSelectedSession(sessionId);
      }
      
      // Pequeno delay para garantir que a sessão foi processada no backend
      setTimeout(async () => {
        try {
          // Certificar que temos um ID de sessão
          if (sessionId) {
            const messagesResponse = await getSessionMessages(sessionId);
            setMessages(messagesResponse.data);
          }
        } catch (error) {
          console.error("Erro ao buscar mensagens atualizadas:", error);
          
          // Se não conseguir buscar com o ID atual, tentar com um formato alternativo
          if (sessionId && sessionId.includes("_")) {
            try {
              // Extrair externalId e agentId do sessionId atual
              const parts = sessionId.split("_");
              // Para lidar com múltiplos underscores, pegamos o primeiro elemento como externalId
              // e o último como agentId
              const externalId = parts[0];
              const agentId = parts[parts.length - 1];
              
              // Tentar com o formato simplificado
              const alternativeId = `${externalId}_${agentId}`;
              
              if (alternativeId !== sessionId) {
                console.log("Tentando formato alternativo de ID:", alternativeId);
                const altResponse = await getSessionMessages(alternativeId);
                setMessages(altResponse.data);
                // Atualizar para o ID correto
                setSelectedSession(alternativeId);
              }
            } catch (altError) {
              console.error("Falha ao tentar formato alternativo:", altError);
            }
          }
        } finally {
          setIsSending(false);
        }
      }, 1500); // Aumentei o tempo para 1.5s
    }
  };

  // Gerar ID de externo (atualizado para remover timestamp)
  const generateExternalId = () => {
    const now = new Date();
    // Formato YYYYMMDDHHMMSSmmm (ano, mês, dia, hora, minuto, segundo, milissegundo)
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, "0") +
           now.getDate().toString().padStart(2, "0") +
           now.getHours().toString().padStart(2, "0") +
           now.getMinutes().toString().padStart(2, "0") +
           now.getSeconds().toString().padStart(2, "0") +
           now.getMilliseconds().toString().padStart(3, "0");
  };

  // Encontrar informações do agente atual
  const currentAgent = agents.find((agent) => agent.id === currentAgentId);

  // Extrair informações da sessão atual
  const getCurrentSessionInfo = () => {
    if (!selectedSession) return null;

    // O formato do sessionId é externalId_agentId
    const parts = selectedSession.split("_");

    try {
      // Tentar extrair data do externalId se estiver no formato correto (YYYYMMDD_HHMMSS)
      const dateStr = parts[0];
      if (dateStr.length >= 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        return {
          externalId: parts[0],
          agentId: parts[1],
          displayDate: `${day}/${month}/${year}`,
        };
      }
    } catch (e) {
      console.error("Erro ao processar ID da sessão:", e);
    }

    return {
      externalId: parts[0],
      agentId: parts[1],
      displayDate: "Sessão",
    };
  };

  // Extrair externalId de um ID de sessão
  const getExternalId = (sessionId: string) => {
    return sessionId.split("_")[0];
  };

  // Função para verificar se o texto contém markdown
  const containsMarkdown = (text: string): boolean => {
    // Se o texto for muito curto, provavelmente não é markdown
    if (!text || text.length < 3) return false;

    // Padrões mais comuns de markdown
    const markdownPatterns = [
      /[*_]{1,2}[^*_]+[*_]{1,2}/, // bold/italic
      /\[[^\]]+\]\([^)]+\)/, // links
      /^#{1,6}\s/m, // headers
      /^[-*+]\s/m, // unordered lists
      /^[0-9]+\.\s/m, // ordered lists
      /^>\s/m, // blockquotes
      /`[^`]+`/, // inline code
      /```[\s\S]*?```/, // code blocks
      /^\|(.+\|)+$/m, // tables
      /!\[[^\]]*\]\([^)]+\)/, // images
    ];

    // Verifica presença de qualquer padrão de markdown
    return markdownPatterns.some((pattern) => pattern.test(text));
  };

  // Função para interpretar o conteúdo da mensagem
  const getMessageText = (
    message: ChatMessage
  ): string | FunctionMessageContent => {
    const author = message.author;
    const parts = message.content.parts;
    
    if (!parts || parts.length === 0) return "Conteúdo vazio";
    
    // Verificar se há uma chamada de função ou resposta de função em qualquer parte
    const functionCallPart = parts.find(part => part.functionCall || part.function_call);
    const functionResponsePart = parts.find(part => part.functionResponse || part.function_response);
    
    // Se houver uma chamada de função, priorizá-la
    if (functionCallPart) {
      const funcCall = functionCallPart.functionCall || functionCallPart.function_call || {};
      const args = funcCall.args || {};
      const name = funcCall.name || "desconhecida";
      const id = funcCall.id || "sem-id";
      
      return {
        author,
        title: `📞 Chamada de função: ${name}`,
        content: `ID: ${id}
Args: ${
        Object.keys(args).length > 0
          ? `\n${JSON.stringify(args, null, 2)}`
          : "{}"
      }`,
      } as FunctionMessageContent;
    }
    
    // Se houver uma resposta de função, priorizá-la
    if (functionResponsePart) {
      const funcResponse =
        functionResponsePart.functionResponse || functionResponsePart.function_response || {};
      const response = funcResponse.response || {};
      const name = funcResponse.name || "desconhecida";
      const id = funcResponse.id || "sem-id";
      const status = response.status || "unknown";
      const statusEmoji = status === "error" ? "❌" : "✅";
      
      let resultText = "";
      if (status === "error") {
        resultText = `Erro: ${
          response.error_message || "Erro desconhecido"
        }`;
      } else if (response.report) {
        resultText = `Resultado: ${response.report}`;
      } else if (response.result && response.result.content) {
        // Processar conteúdo de resposta que pode vir no formato de result.content
        const content = response.result.content;
        if (
          Array.isArray(content) &&
          content.length > 0 &&
          content[0].text
        ) {
          try {
            // Tentar analisar o conteúdo como JSON se for uma string
            const textContent = content[0].text;
            const parsedJson = JSON.parse(textContent);
            resultText = `Resultado: \n${JSON.stringify(
              parsedJson,
              null,
              2
            )}`;
          } catch (e) {
            // Se não for JSON válido, exibir como texto
            resultText = `Resultado: ${content[0].text}`;
          }
        } else {
          resultText = `Resultado:\n${JSON.stringify(response, null, 2)}`;
        }
      } else {
        resultText = `Resultado:\n${JSON.stringify(response, null, 2)}`;
      }
      
      return {
        author,
        title: `${statusEmoji} Resposta da função: ${name}`,
        content: `ID: ${id}\n${resultText}`,
      } as FunctionMessageContent;
    }
    
    // Se só houver uma parte com texto, retorne-a diretamente
    if (parts.length === 1 && parts[0].text) {
      return {
        author,
        content: parts[0].text,
        title: "Mensagem",
      } as FunctionMessageContent;
    }

    // Se chegamos aqui, não há chamadas de função, então juntamos todas as partes de texto
    const textParts = parts
      .filter(part => part.text)
      .map(part => part.text)
      .filter(text => text);
    
    if (textParts.length > 0) {
      return {
        author,
        content: textParts.join("\n\n"),
        title: "Mensagem",
      } as FunctionMessageContent;
    }

    // Se não encontramos nada útil, tentamos representar o conteúdo como JSON
    try {
      return JSON.stringify(parts, null, 2).replace(/\\n/g, "\n");
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      return "Não foi possível interpretar o conteúdo da mensagem";
    }
  };

  // Função para alternar a expansão de uma mensagem de função
  const toggleFunctionExpansion = (messageId: string) => {
    setExpandedFunctions((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Cores para agentes - mapeamento por nome
  const agentColors: Record<string, string> = {
    Assistente: "bg-[#00ff9d]",
    Programador: "bg-[#00cc7d]",
    Redator: "bg-[#00b8ff]",
    Pesquisador: "bg-[#ff9d00]",
    Planejador: "bg-[#9d00ff]",
    default: "bg-[#333]",
  };

  const getAgentColor = (agentName: string) => {
    return agentColors[agentName] || agentColors.default;
  };

  // Adicionar esta função dentro do componente Chat
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enviar mensagem ao pressionar Enter sem Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
    // Quando Shift+Enter é pressionado, deixamos o comportamento padrão (quebra de linha)
  };

  // Função para ajustar automaticamente a altura do textarea
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // Primeiro reset para altura mínima para calcular corretamente
    textarea.style.height = "auto";

    // Limitar a 10 linhas no máximo
    const maxHeight = 10 * 24; // 24px é aproximadamente a altura de uma linha (ajuste conforme necessário)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;

    // Atualizar o state com o novo valor
    setMessageInput(textarea.value);
  };

  // Função para excluir uma sessão
  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    
    try {
      // Chamar a API para excluir a sessão
      await deleteSession(selectedSession);
      
      // Atualizar a lista de sessões localmente
      setSessions(sessions.filter(session => session.id !== selectedSession));
      setSelectedSession(null);
      setMessages([]);
      setCurrentAgentId(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Sessão excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir sessão:", error);
      toast({
        title: "Erro ao excluir sessão",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen max-h-screen bg-[#121212]">
      {/* Sidebar - Lista de sessões de chat */}
      <div className="w-64 border-r border-[#333] flex flex-col bg-[#1a1a1a]">
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setIsNewChatDialogOpen(true)}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Nova Conversa
            </Button>
          </div>

          {/* Busca e Filtros */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-8 bg-[#222] border-[#444] text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#333]"
                onClick={() => setShowAgentFilter(!showAgentFilter)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtrar
              </Button>

              {selectedAgentFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgentFilter("all")}
                  className="text-gray-400 hover:text-white hover:bg-[#333]"
                >
                  Limpar filtro
                </Button>
              )}
            </div>

            {showAgentFilter && (
              <div className="pt-1">
                <Select
                  value={selectedAgentFilter}
                  onValueChange={setSelectedAgentFilter}
                >
                  <SelectTrigger className="bg-[#222] border-[#444] text-white">
                    <SelectValue placeholder="Filtrar por agente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#444] text-white">
                    <SelectItem
                      value="all"
                      className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                    >
                      Todos os agentes
                    </SelectItem>
                    {agents.map((agent) => (
                      <SelectItem
                        key={agent.id}
                        value={agent.id}
                        className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                      >
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Lista de sessões */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-5 w-5 text-[#00ff9d] animate-spin" />
            </div>
          ) : sortedSessions.length > 0 ? (
            <div className="divide-y divide-[#333]">
              {sortedSessions.map((session) => {
                // Extrair ID do agente do ID da sessão
                const agentId = session.id.split("_")[1];
                const agentInfo = agents.find((a) => a.id === agentId);
                const externalId = getExternalId(session.id);

                return (
                  <div
                    key={session.id}
                    className={`p-3 hover:bg-[#222] cursor-pointer ${
                      selectedSession === session.id ? "bg-[#2a2a2a]" : ""
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#00ff9d] mr-2"></div>
                        <div className="text-white font-medium truncate max-w-[200px]">
                          {externalId}
                        </div>
                      </div>
                      {agentInfo && (
                        <Badge className="bg-[#333] text-[#00ff9d] border-none text-xs">
                          {agentInfo.name}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">
                        {formatDateTime(session.update_time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchTerm || selectedAgentFilter !== "all" ? (
            <div className="p-4 text-center text-gray-400">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Clique em "Nova" para iniciar
            </div>
          )}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedSession || currentAgentId ? (
          <>
            {/* Cabeçalho */}
            <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
              {/* Extrair informações da sessão atual */}
              {(() => {
                const sessionInfo = getCurrentSessionInfo();

                return (
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-[#00ff9d]" />
                      {selectedSession
                        ? `Sessão ${sessionInfo?.externalId || selectedSession}`
                        : "Nova Conversa"}
                    </h2>

                    <div className="flex items-center gap-2">
                      {currentAgent && (
                        <Badge className="bg-[#00ff9d] text-black px-3 py-1 text-sm">
                          {currentAgent.name || currentAgentId}
                        </Badge>
                      )}
                      
                      {selectedSession && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-[#333]"
                          onClick={() => setIsDeleteDialogOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Mensagens */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-[#121212]"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 text-[#00ff9d] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-gray-400">
                  <p>
                    Nenhuma mensagem nesta conversa. Comece digitando abaixo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 w-full max-w-full">
                  {messages.map((message) => {
                    const isUser = message.author === "user";
                    const agentColor = getAgentColor(message.author);
                    const messageContent = getMessageText(message);
                    const hasFunctionCall = message.content.parts.some(
                      (part) => part.functionCall || part.function_call
                    );
                    const hasFunctionResponse = message.content.parts.some(
                      (part) => part.functionResponse || part.function_response
                    );
                    const isFunctionMessage =
                      hasFunctionCall || hasFunctionResponse;
                    const isExpanded = expandedFunctions[message.id] || false;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        } w-full`}
                      >
                        <div
                          className={`flex gap-3 ${
                            isUser ? "flex-row-reverse" : ""
                          } max-w-[90%]`}
                        >
                          <Avatar className={isUser ? "bg-[#333]" : agentColor}>
                            <AvatarFallback>
                              {isUser ? "U" : message.author[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              isFunctionMessage
                                ? "bg-[#333] text-[#00ff9d] font-mono text-sm"
                                : isUser
                                ? "bg-[#00ff9d] text-black"
                                : "bg-[#222] text-white"
                            } w-full overflow-hidden`}
                            style={{ wordBreak: "break-word" }}
                          >
                            {isFunctionMessage ? (
                              <div className="w-full">
                                <div
                                  className="flex items-center gap-2 cursor-pointer hover:bg-[#444] rounded px-1 py-0.5 transition-colors"
                                  onClick={() =>
                                    toggleFunctionExpansion(message.id)
                                  }
                                >
                                  {typeof messageContent === "object" &&
                                    "title" in messageContent && (
                                      <>
                                        <div className="flex-1 font-semibold">
                                          {
                                            (
                                              messageContent as FunctionMessageContent
                                            ).title
                                          }
                                        </div>
                                        <div className="flex items-center justify-center w-5 h-5 text-[#00ff9d]">
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </div>
                                      </>
                                    )}
                                </div>

                                {isExpanded &&
                                  typeof messageContent === "object" &&
                                  "content" in messageContent && (
                                    <div className="mt-2 pt-2 border-t border-[#555]">
                                      <pre className="whitespace-pre-wrap break-all overflow-hidden text-xs">
                                        {
                                          (
                                            messageContent as FunctionMessageContent
                                          ).content
                                        }
                                      </pre>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <div className="markdown-content break-words">
                                {/* Usar o author do objeto messageContent se disponível e não for do usuário */}
                                {typeof messageContent === "object" && 
                                 "author" in messageContent && 
                                 messageContent.author !== "user" && (
                                  <div className="text-xs text-gray-400 mb-1">
                                    {messageContent.author}
                                  </div>
                                )}
                                {(typeof messageContent === "string" && containsMarkdown(messageContent)) || 
                                 (typeof messageContent === "object" && 
                                  "content" in messageContent && 
                                  typeof messageContent.content === "string" && 
                                  containsMarkdown(messageContent.content)) ? (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      h1: ({ ...props }) => (
                                        <h1
                                          className="text-xl font-bold my-4"
                                          {...props}
                                        />
                                      ),
                                      h2: ({ ...props }) => (
                                        <h2
                                          className="text-lg font-bold my-3"
                                          {...props}
                                        />
                                      ),
                                      h3: ({ ...props }) => (
                                        <h3
                                          className="text-base font-bold my-2"
                                          {...props}
                                        />
                                      ),
                                      h4: ({ ...props }) => (
                                        <h4
                                          className="font-semibold my-2"
                                          {...props}
                                        />
                                      ),
                                      p: ({ ...props }) => (
                                        <p className="mb-3" {...props} />
                                      ),
                                      ul: ({ ...props }) => (
                                        <ul
                                          className="list-disc pl-6 mb-3 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      ol: ({ ...props }) => (
                                        <ol
                                          className="list-decimal pl-6 mb-3 space-y-1"
                                          {...props}
                                        />
                                      ),
                                      li: ({ ...props }) => (
                                        <li className="mb-1" {...props} />
                                      ),
                                      a: ({ ...props }) => (
                                        <a
                                          className="text-[#00ff9d] underline hover:opacity-80 transition-opacity"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          {...props}
                                        />
                                      ),
                                      blockquote: ({ ...props }) => (
                                        <blockquote
                                          className="border-l-4 border-[#444] pl-4 py-1 italic my-3 text-gray-300"
                                          {...props}
                                        />
                                      ),
                                      code: ({
                                        className,
                                        children,
                                        ...props
                                      }: any) => {
                                        const match = /language-(\w+)/.exec(
                                          className || ""
                                        );
                                        const isInline =
                                          !match &&
                                          typeof children === "string" &&
                                          !children.includes("\n");

                                        if (isInline) {
                                          return (
                                            <code
                                              className="bg-[#333] px-1.5 py-0.5 rounded text-[#00ff9d] text-sm font-mono"
                                              {...props}
                                            >
                                              {children}
                                            </code>
                                          );
                                        }

                                        return (
                                          <pre className="bg-[#2a2a2a] p-3 rounded-md my-3 overflow-x-auto">
                                            <code
                                              className="text-[#00ff9d] font-mono text-sm"
                                              {...props}
                                            >
                                              {children}
                                            </code>
                                          </pre>
                                        );
                                      },
                                      pre: ({ ...props }) => (
                                        <pre
                                          className="bg-[#2a2a2a] p-0 rounded-md my-3 overflow-x-auto font-mono text-sm"
                                          {...props}
                                        />
                                      ),
                                      table: ({ ...props }) => (
                                        <div className="overflow-x-auto my-3 rounded border border-[#444]">
                                          <table
                                            className="min-w-full border-collapse text-sm"
                                            {...props}
                                          />
                                        </div>
                                      ),
                                      thead: ({ ...props }) => (
                                        <thead
                                          className="bg-[#333]"
                                          {...props}
                                        />
                                      ),
                                      tbody: ({ ...props }) => (
                                        <tbody
                                          className="divide-y divide-[#444]"
                                          {...props}
                                        />
                                      ),
                                      tr: ({ ...props }) => (
                                        <tr
                                          className="hover:bg-[#2a2a2a] transition-colors"
                                          {...props}
                                        />
                                      ),
                                      th: ({ ...props }) => (
                                        <th
                                          className="px-4 py-2 text-left font-medium text-gray-300"
                                          {...props}
                                        />
                                      ),
                                      td: ({ ...props }) => (
                                        <td
                                          className="px-4 py-2 border-[#444]"
                                          {...props}
                                        />
                                      ),
                                      img: ({ ...props }) => (
                                        <img
                                          className="max-w-full h-auto my-3 rounded"
                                          {...props}
                                        />
                                      ),
                                      hr: ({ ...props }) => (
                                        <hr
                                          className="border-[#444] my-4"
                                          {...props}
                                        />
                                      ),
                                      strong: ({ ...props }) => (
                                        <strong
                                          className="font-bold"
                                          {...props}
                                        />
                                      ),
                                      em: ({ ...props }) => (
                                        <em className="italic" {...props} />
                                      ),
                                      del: ({ ...props }) => (
                                        <del
                                          className="line-through"
                                          {...props}
                                        />
                                      ),
                                    }}
                                  >
                                    {typeof messageContent === "string" 
                                      ? messageContent 
                                      : typeof messageContent === "object" && "content" in messageContent
                                      ? messageContent.content
                                      : ""}
                                  </ReactMarkdown>
                                ) : (
                                  <span>
                                    {typeof messageContent === "string"
                                      ? messageContent
                                      : typeof messageContent === "object" && "content" in messageContent
                                      ? messageContent.content
                                      : JSON.stringify(messageContent)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Indicador de digitação */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Avatar
                          className={
                            currentAgent
                              ? getAgentColor(currentAgent.name)
                              : "bg-[#00ff9d]"
                          }
                        >
                          <AvatarFallback>
                            {currentAgent?.name?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 bg-[#222]">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.2s]"></div>
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Área de entrada de mensagem */}
            <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Textarea
                  value={messageInput}
                  onChange={autoResizeTextarea}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-[#222] border-[#444] text-white focus-visible:ring-[#00ff9d] min-h-[40px] max-h-[240px] resize-none"
                  disabled={isSending || isLoading}
                  rows={1}
                />
                <Button
                  type="submit"
                  disabled={
                    isSending ||
                    isLoading ||
                    !messageInput.trim() ||
                    !currentAgentId
                  }
                  className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-16 w-16 text-[#00ff9d] mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-3">
              Selecione uma conversa
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Escolha uma conversa existente ou inicie uma nova.
            </p>
            <Button
              onClick={() => setIsNewChatDialogOpen(true)}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] px-6 py-2"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Conversa
            </Button>
          </div>
        )}
      </div>

      {/* Modal para criar nova conversa */}
      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Nova Conversa
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione um agente para iniciar uma nova conversa.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Campo de busca para agentes */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar agentes..."
                className="pl-8 bg-[#222] border-[#444] text-white"
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
              />
              {agentSearchTerm && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setAgentSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="text-sm text-gray-300 mb-2">Escolha um agente:</div>

            <ScrollArea className="h-[300px] pr-2">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-[#00ff9d] animate-spin" />
                </div>
              ) : filteredAgents.length > 0 ? (
                <div className="space-y-2">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-3 rounded-md cursor-pointer transition-colors bg-[#222] hover:bg-[#333]"
                      onClick={() => selectAgent(agent.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={16} className="text-[#00ff9d]" />
                        <span className="font-medium text-white">{agent.name}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge className="text-xs bg-[#333] text-[#00ff9d] border-[#00ff9d]/30">
                          {agent.type}
                        </Badge>
                        {agent.model && (
                          <span className="text-xs text-gray-400">{agent.model}</span>
                        )}
                      </div>
                      {agent.description && (
                        <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                          {agent.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : agentSearchTerm ? (
                <div className="text-center py-4 text-gray-400">
                  Nenhum agente encontrado com "{agentSearchTerm}"
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p>Nenhum agente disponível</p>
                  <p className="text-sm mt-2">
                    Crie agentes na tela de Gerenciamento de Agentes
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsNewChatDialogOpen(false)}
              variant="outline"
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333]"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar exclusão de sessão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Excluir Sessão
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteSession}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
