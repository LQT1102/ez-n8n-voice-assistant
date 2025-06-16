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
  googleSheetUrl?: string;
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
  googleSheetUrl,
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

  const handleOpenGoogleSheet = () => {
    if (googleSheetUrl) {
      window.open(googleSheetUrl, "_blank");
    } else {
      // Fallback URL nếu không có URL được cấu hình
      const defaultSheetUrl =
        "https://docs.google.com/spreadsheets/d/1YOUR_SHEET_ID/edit#gid=0";
      window.open(defaultSheetUrl, "_blank");
    }
  };

  // Auto resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [textInput]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold text-gray-800">Cuộc trò chuyện</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Google Sheet Button */}
          <button
            onClick={handleOpenGoogleSheet}
            className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded-lg 
                     hover:bg-green-200 transition-colors focus:outline-none 
                     focus:ring-2 focus:ring-green-300 flex items-center space-x-1"
            title="Xem bảng lưu thông tin"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                clipRule="evenodd"
              />
            </svg>
            <span>📊 Bảng dữ liệu</span>
          </button>

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
              <p className="text-sm">
                Hãy gõ tin nhắn hoặc nói để tạo cuộc trò chuyện đầu tiên
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                  max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm
                  ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }
                `}
                >
                  {/* Message Content */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>

                  {/* Timestamp */}
                  <div
                    className={`
                    text-xs mt-1 
                    ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }
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
            <span className="text-xs text-blue-600">
              {currentTranscript.length} ký tự
            </span>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed">
            {currentTranscript}
          </p>
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
            <svg
              className="w-4 h-4 text-yellow-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
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

      {/* Voice Controls - Moved above text input */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3 border border-blue-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Mic Button - Larger and more prominent */}
          <button
            onClick={onToggleRecording}
            disabled={isSending || !isSupported}
            className={`
              w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-lg
              ${
                isListening
                  ? "bg-red-500 border-red-600 animate-pulse shadow-red-200"
                  : "bg-blue-500 border-blue-600 hover:bg-blue-600 shadow-blue-200"
              }
              ${
                isSending || !isSupported
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:scale-105"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
            title={
              isSupported
                ? isListening
                  ? "Dừng ghi âm"
                  : "Bắt đầu ghi âm"
                : "Trình duyệt không hỗ trợ"
            }
          >
            <div className="flex items-center justify-center h-full">
              {isListening ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Status Text - More prominent */}
          <div className="text-sm">
            {isListening && (
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold">🎤 Đang nghe...</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-500 rounded animate-pulse"></div>
                  <div className="w-1 h-3 bg-red-400 rounded animate-pulse delay-75"></div>
                  <div className="w-1 h-5 bg-red-500 rounded animate-pulse delay-150"></div>
                </div>
              </div>
            )}
            {isSending && (
              <span className="text-blue-600 font-medium">
                ⏳ Đang xử lý...
              </span>
            )}
            {!isListening && !isSending && isSupported && (
              <span className="text-gray-600 font-medium">
                🎙️ Nhấn để bắt đầu nói
              </span>
            )}
            {!isSupported && (
              <span className="text-red-500 font-medium">
                ❌ Không hỗ trợ mic
              </span>
            )}
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={onTestFakeData}
          disabled={isSending}
          className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center space-x-2"
          title="Test với dữ liệu mẫu"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <span>🧪 Test</span>
        </button>
      </div>

      {/* Text Input Area - Moved below voice controls */}
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
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
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
        {textInput && (
          <div className="text-xs text-gray-500 mt-1">
            {textInput.length} ký tự
          </div>
        )}
      </div>

      {/* Message Count */}
      {messages.length > 0 && (
        <div className="mt-2 text-center text-xs text-gray-500 flex-shrink-0">
          Tổng cộng {messages.length} tin nhắn
        </div>
      )}
    </div>
  );
};
