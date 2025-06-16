import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";

interface Message {
  id: string;
  text: string;
  type: "user" | "assistant";
  timestamp: Date;
}

interface UseN8nIntegrationProps {
  webhookUrl: string;
  apiKey?: string | null;
}

interface UseN8nIntegrationReturn {
  messages: Message[];
  isSending: boolean;
  error: string | null;
  sendMessage: (command: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}

// Utility function để tạo GUID chuẩn
const generateGUID = (): string => {
  // Sử dụng crypto.randomUUID nếu có, fallback về custom implementation
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: tạo GUID theo format standard
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Utility function để tạo user ID persistent
const getUserId = (): string => {
  let userId = localStorage.getItem("voice-assistant-user-id");
  if (!userId) {
    userId = generateGUID();
    localStorage.setItem("voice-assistant-user-id", userId);
  }
  return userId;
};

export const useN8nIntegration = ({
  webhookUrl,
  apiKey,
}: UseN8nIntegrationProps): UseN8nIntegrationReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo sessionId mới mỗi khi khởi tạo hook (mỗi lần refresh app)
  const sessionIdRef = useRef<string>(generateGUID());
  const userIdRef = useRef<string>(getUserId());

  // Log session info khi khởi tạo
  useEffect(() => {
    console.log("🎯 New Chat Session Started:", {
      sessionId: sessionIdRef.current,
      userId: userIdRef.current,
      timestamp: new Date().toISOString(),
      note: "SessionId sẽ thay đổi mỗi khi refresh app (F5)",
    });
  }, []);

  const sendMessage = useCallback(
    async (command: string) => {
      if (!command.trim()) return;

      setIsSending(true);
      setError(null);

      // Thêm tin nhắn của user vào chat
      const userMessage: Message = {
        id: generateGUID(),
        text: command,
        type: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Chuẩn bị headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Thêm API key vào header nếu có
        if (apiKey) {
          headers["key"] = apiKey;
        }

        // Chuẩn bị payload với session information
        const payload = {
          command: command.trim(),
          timestamp: new Date().toISOString(),
          userId: userIdRef.current,
          sessionId: sessionIdRef.current, // GUID được sinh ngẫu nhiên mỗi phiên
          messageId: userMessage.id,
          // Thêm context về cuộc hội thoại
          conversationContext: {
            messageCount: messages.length + 1, // +1 vì đã thêm user message
            conversationStarted:
              messages.length === 0 ? new Date().toISOString() : undefined,
            previousMessages: messages.slice(-3).map((msg) => ({
              // Gửi 3 tin nhắn gần nhất làm context
              type: msg.type,
              text: msg.text,
              timestamp: msg.timestamp.toISOString(),
            })),
          },
        };

        console.log("📤 Sending to n8n with SessionId:", {
          sessionId: sessionIdRef.current,
          userId: userIdRef.current,
          command: command.trim(),
          messageCount: payload.conversationContext.messageCount,
          fullPayload: payload,
        });

        // Gửi request tới n8n
        const response = await axios.post(webhookUrl, payload, {
          headers,
          timeout: 30000, // 30 giây timeout
        });

        console.log("📥 Received from n8n:", {
          sessionId: sessionIdRef.current,
          responseData: response.data,
          responseHeaders: response.headers,
        });

        // Xử lý response từ n8n
        let assistantText = "";

        if (typeof response.data === "string") {
          assistantText = response.data;
        } else if (typeof response.data === "object") {
          // Thử các field có thể có
          assistantText =
            response.data.message ||
            response.data.response ||
            response.data.text ||
            response.data.reply ||
            JSON.stringify(response.data);
        } else {
          assistantText = "Đã nhận phản hồi từ n8n";
        }

        // Thêm phản hồi từ assistant vào chat
        const assistantMessage: Message = {
          id: generateGUID(),
          text: assistantText,
          type: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("Error sending message to n8n:", err);

        let errorMessage = "Không thể kết nối tới n8n";

        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "API key không hợp lệ hoặc đã hết hạn";
          } else if (err.response.status === 403) {
            errorMessage = "Không có quyền truy cập";
          } else if (err.response.status === 404) {
            errorMessage = "Không tìm thấy endpoint n8n";
          } else {
            errorMessage = `Lỗi từ server: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "Không thể kết nối tới server n8n";
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Timeout - n8n phản hồi quá chậm";
        }

        setError(errorMessage);

        // Thêm error message vào chat
        const errorChatMessage: Message = {
          id: generateGUID(),
          text: `❌ ${errorMessage}`,
          type: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setIsSending(false);
      }
    },
    [webhookUrl, apiKey, messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    // Tạo session ID mới khi clear messages (tương đương refresh phiên chat)
    sessionIdRef.current = generateGUID();
    console.log("🔄 New Chat Session Created:", {
      newSessionId: sessionIdRef.current,
      userId: userIdRef.current,
      timestamp: new Date().toISOString(),
      note: "Session được làm mới thủ công",
    });
  }, []);

  return {
    messages,
    isSending,
    error,
    sendMessage,
    clearMessages,
    sessionId: sessionIdRef.current,
  };
};
