import React from "react";
import { VoiceMessage } from "../types";

interface MessageListProps {
  messages: VoiceMessage[];
  onClearMessages: () => void;
  currentTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  speechError: string | null;
  isSending: boolean;
  onToggleRecording: () => void;
  onSendMessage: (message: string) => Promise<void>;
  onTestFakeData: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onClearMessages,
  currentTranscript,
  isListening,
  isSupported,
  speechError,
  isSending,
  onToggleRecording,
  onSendMessage,
  onTestFakeData,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = React.useState<string>("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom khi có tin nhắn mới
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleSendCurrentTranscript = () => {
    if (currentTranscript.trim()) {
      onSendMessage(currentTranscript);
    }
  };

  const handleSendTextInput = () => {
    if (textInput.trim()) {
      onSendMessage(textInput.trim());
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendTextInput();
    }
  };

  // Auto resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [textInput]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold text-gray-800">Cuộc trò chuyện</h3>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearMessages}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg 
                     hover:bg-red-200 transition-colors focus:outline-none 
                     focus:ring-2 focus:ring-red-300"
          >
            🗑️ Xóa tất cả
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
              <p className="text-sm">Hãy gõ tin nhắn hoặc nói để tạo cuộc trò chuyện đầu tiên</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm
                  ${
                    message.type === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-800 border border-gray-200"
                  }
                `}
                >
                  {/* Message Content */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                  {/* Timestamp */}
                  <div
                    className={`
                    text-xs mt-1 
                    ${message.type === "user" ? "text-blue-100" : "text-gray-500"}
                  `}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Current Transcript Display */}
      {currentTranscript && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border-l-4 border-blue-500 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
              Đang nhận dạng giọng nói...
            </span>
            <span className="text-xs text-blue-600">{currentTranscript.length} ký tự</span>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed">{currentTranscript}</p>
          <button
            onClick={handleSendCurrentTranscript}
            disabled={isSending || !currentTranscript.trim()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? "Đang gửi..." : "Gửi ngay"}
          </button>
        </div>
      )}

      {/* Speech Error Display */}
      {speechError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex-shrink-0">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-yellow-700 text-xs">{speechError}</p>
          </div>
        </div>
      )}

      {/* Text Input Area */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 flex-shrink-0">
        <div className="flex items-start space-x-3">
          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none min-h-[40px] max-h-[120px]
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendTextInput}
            disabled={isSending || !textInput.trim()}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                     focus:outline-none focus:ring-2 focus:ring-green-300 flex items-center justify-center
                     min-h-[40px] min-w-[44px]"
            title="Gửi tin nhắn"
          >
            {isSending ? (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Character count */}
        {textInput && <div className="text-xs text-gray-500 mt-1">{textInput.length} ký tự</div>}
      </div>

      {/* Voice Controls - Compact at bottom */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Mic Button - Small */}
          <button
            onClick={onToggleRecording}
            disabled={isSending || !isSupported}
            className={`
              w-10 h-10 rounded-full border-2 transition-all duration-200
              ${
                isListening
                  ? "bg-red-500 border-red-600 animate-pulse"
                  : "bg-blue-500 border-blue-600 hover:bg-blue-600"
              }
              ${isSending || !isSupported ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}
              focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
            title={isSupported ? (isListening ? "Dừng ghi âm" : "Bắt đầu ghi âm") : "Trình duyệt không hỗ trợ"}
          >
            <div className="flex items-center justify-center h-full">
              {isListening ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Status Text */}
          <div className="text-sm">
            {isListening && <span className="text-red-600 font-medium">🎤 Đang nghe...</span>}
            {isSending && <span className="text-blue-600 font-medium">⏳ Đang xử lý...</span>}
            {!isListening && !isSending && isSupported && <span className="text-gray-500">Nhấn mic để nói</span>}
            {!isSupported && <span className="text-red-500">Không hỗ trợ mic</span>}
          </div>
        </div>

        {/* Test Button - Small */}
        <button
          onClick={onTestFakeData}
          disabled={isSending}
          className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-purple-300"
          title="Test với dữ liệu mẫu"
        >
          🧪 Test
        </button>
      </div>

      {/* Message Count */}
      {messages.length > 0 && (
        <div className="mt-2 text-center text-xs text-gray-500 flex-shrink-0">Tổng cộng {messages.length} tin nhắn</div>
      )}
    </div>
  );
};
