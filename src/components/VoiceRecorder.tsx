import React from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptChange, onSendMessage, isProcessing }) => {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setFakeTranscript,
  } = useSpeechRecognition();

  // Cập nhật transcript khi có thay đổi
  React.useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
      resetTranscript();
    }
  };

  // Xử lý toggle recording
  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Xử lý test fake data
  const handleTestFakeData = () => {
    setFakeTranscript("Thời tiết hôm nay là bao nhiêu độ");
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Trình duyệt không hỗ trợ</div>
        <p className="text-red-500 mb-4">
          Trình duyệt của bạn không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge hoặc Firefox phiên bản mới
          nhất.
        </p>
        <button
          onClick={handleTestFakeData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          🧪 Sử dụng dữ liệu mẫu
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Trợ lý giọng nói</h2>
        <p className="text-gray-600">Nhấn nút microphone để bắt đầu nói</p>
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full border-4 transition-all duration-300 transform
            ${
              isListening
                ? "bg-red-500 border-red-600 scale-110 animate-pulse-slow"
                : "bg-blue-500 border-blue-600 hover:bg-blue-600 hover:scale-105"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            focus:outline-none focus:ring-4 focus:ring-blue-300
          `}
        >
          <div className="flex items-center justify-center h-full">
            {isListening ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Recording indicator */}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-bounce-slow"></div>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="text-center">
        {isListening && <p className="text-red-600 font-medium animate-pulse">🎤 Đang lắng nghe...</p>}
        {isProcessing && <p className="text-blue-600 font-medium">⏳ Đang xử lý...</p>}
        {!isListening && !isProcessing && <p className="text-gray-500">Nhấn microphone để bắt đầu</p>}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Văn bản đã nhận dạng:</h3>
          <p className="text-gray-800 leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {transcript && (
          <>
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !transcript.trim()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              📤 Gửi tin nhắn
            </button>
            <button
              onClick={resetTranscript}
              disabled={isProcessing}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              🗑️ Xóa
            </button>
          </>
        )}

        {/* Test Button */}
        <button
          onClick={handleTestFakeData}
          disabled={isProcessing}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
        >
          🧪 Test Data
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
