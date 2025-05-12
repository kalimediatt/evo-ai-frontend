import { useEffect, useRef, useCallback, useState } from "react";

interface UseAgentWebSocketProps {
    agentId: string;
    externalId: string;
    jwt: string;
    onEvent: (event: any) => void;
    onTurnComplete?: () => void;
}

export function useAgentWebSocket({
    agentId,
    externalId,
    jwt,
    onEvent,
    onTurnComplete,
}: UseAgentWebSocketProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);

    // Função para abrir conexão WebSocket
    const openWebSocket = useCallback(() => {
        if (!agentId || !externalId || !jwt) {
            return;
        }
        // Monta a URL do WebSocket e loga
        const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws").replace("https", "wss")}/api/v1/chat/ws/${agentId}/${externalId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "authorization",
                    token: jwt,
                })
            );
            if (pendingMessage) {
                ws.send(JSON.stringify({ message: pendingMessage }));
                setPendingMessage(null);
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    let eventObj = data.message;
                    if (typeof data.message === "string" && data.message.trim() !== "") {
                        try {
                            eventObj = JSON.parse(data.message);
                        } catch (e) {
                            console.warn("[WebSocket] data.message não é JSON válido:", data.message);
                        }
                    }
                    onEvent(eventObj);
                }
                if (data.turn_complete && onTurnComplete) {
                    onTurnComplete();
                }
            } catch (err) {
                console.error("[WebSocket] Error processing message:", err, event.data);
            }
        };

        ws.onerror = (err) => {
            console.error("[WebSocket] connection error:", err);
        };

        ws.onclose = (event) => {
            console.warn("[WebSocket] connection closed:", event);
        };
    }, [agentId, externalId, jwt, onEvent, onTurnComplete, pendingMessage]);

    useEffect(() => {
        openWebSocket();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [openWebSocket]);

    const sendMessage = useCallback((msg: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: msg }));
        } else {
            console.warn("[WebSocket] unable to send message, connection not open.");
            setPendingMessage(msg);
            openWebSocket();
        }
    }, [openWebSocket]);

    return { sendMessage };
}
