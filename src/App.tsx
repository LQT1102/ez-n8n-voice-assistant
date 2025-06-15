import React, { useState, useCallback, useEffect } from "react";
import { MessageList } from "./components/MessageList";
import { ConfigPanel } from "./components/ConfigPanel";
import { LoginPage } from "./components/LoginPage";
import { useN8nIntegration } from "./hooks/useN8nIntegration";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useAuth } from "./hooks/useAuth";
import { AppConfig } from "./types";

function App() {
  // Auth state
  const { authState, login, logout, isLoading: authLoading } = useAuth();

  // State cho cấu hình
  const [config, setConfig] = useState<AppConfig>({
    n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/voice-assistant",
  });

  // State cho UI
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [isConfigVisible, setIsConfigVisible] = useState<boolean>(false);

  // Load cấu hình từ localStorage khi khởi tạo
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("n8n-voice-assistant-config");
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        // Merge với env config, ưu tiên localStorage
        setConfig({
          n8nWebhookUrl:
            parsedConfig.n8nWebhookUrl ||
            import.meta.env.VITE_N8N_WEBHOOK_URL ||
            "http://localhost:5678/webhook/voice-assistant",
        });
      }
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
    }
  }, []);

  // Hook tích hợp n8n (chỉ khi đã authenticated)
  const {
    messages,
    isSending,
    error: n8nError,
    sendMessage,
    clearMessages,
  } = useN8nIntegration({
    webhookUrl: config.n8nWebhookUrl,
    apiKey: authState.apiKey,
  });

  // Hook speech recognition (chỉ khi đã authenticated)
  const {
    transcript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setFakeTranscript,
  } = useSpeechRecognition();

  // Cập nhật transcript khi có thay đổi
  useEffect(() => {
    if (authState.isAuthenticated) {
      setCurrentTranscript(transcript);
    }
  }, [transcript, authState.isAuthenticated]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || !authState.isAuthenticated) return;

      try {
        await sendMessage(message);
        setCurrentTranscript("");
        resetTranscript();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [sendMessage, resetTranscript, authState.isAuthenticated]
  );

  // Xử lý toggle recording
  const handleToggleRecording = useCallback(() => {
    if (!authState.isAuthenticated) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening, authState.isAuthenticated]);

  // Xử lý test fake data
  const handleTestFakeData = useCallback(() => {
    if (!authState.isAuthenticated) return;
    setFakeTranscript("Thời tiết hôm nay là bao nhiêu độ");
  }, [setFakeTranscript, authState.isAuthenticated]);

  // Xử lý thay đổi cấu hình
  const handleConfigChange = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
  }, []);

  // Toggle config panel
  const handleToggleConfig = useCallback(() => {
    setIsConfigVisible((prev) => !prev);
  }, []);

  // Xử lý logout
  const handleLogout = useCallback(() => {
    logout();
    setCurrentTranscript("");
    resetTranscript();
    clearMessages();
  }, [logout, resetTranscript, clearMessages]);

  // Nếu chưa authenticated, hiển thị login page
  if (!authState.isAuthenticated) {
    return <LoginPage onLogin={login} isLoading={authLoading} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EZ n8n Voice Assistant</h1>
                <p className="text-sm text-gray-600">Trợ lý giọng nói tích hợp với n8n</p>
              </div>
            </div>

            {/* Status indicators và Logout button */}
            <div className="flex items-center space-x-4">
              {isSending && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600">Đang xử lý...</span>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg 
                         hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Đăng xuất"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages Section với mic controls */}
        <MessageList
          messages={messages}
          onClearMessages={clearMessages}
          currentTranscript={currentTranscript}
          isListening={isListening}
          isSupported={isSupported}
          speechError={speechError}
          isSending={isSending}
          onToggleRecording={handleToggleRecording}
          onSendMessage={handleSendMessage}
          onTestFakeData={handleTestFakeData}
        />

        {/* Error Display */}
        {n8nError && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-red-800 font-semibold">Lỗi kết nối n8n</h4>
                <p className="text-red-700 text-sm">{n8nError}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>© 2024 EZ n8n Voice Assistant. Được xây dựng với React & n8n.</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Tổng tin nhắn: {messages.length}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Config Panel */}
      <ConfigPanel
        config={config}
        onConfigChange={handleConfigChange}
        isVisible={isConfigVisible}
        onToggleVisibility={handleToggleConfig}
      />
    </div>
  );
}

export default App;
