import { useState, useCallback } from "react";
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
}

export const useN8nIntegration = ({ webhookUrl, apiKey }: UseN8nIntegrationProps): UseN8nIntegrationReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (command: string) => {
      if (!command.trim()) return;

      setIsSending(true);
      setError(null);

      // Thêm tin nhắn của user vào chat
      const userMessage: Message = {
        id: Date.now().toString(),
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

        // Gửi request tới n8n
        const response = await axios.post(
          webhookUrl,
          {
            command: command.trim(),
            timestamp: new Date().toISOString(),
            userId: "voice-assistant-user",
          },
          {
            headers,
            timeout: 30000, // 30 giây timeout
          }
        );

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
          id: (Date.now() + 1).toString(),
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
          id: (Date.now() + 1).toString(),
          text: `❌ ${errorMessage}`,
          type: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setIsSending(false);
      }
    },
    [webhookUrl, apiKey]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isSending,
    error,
    sendMessage,
    clearMessages,
  };
};
