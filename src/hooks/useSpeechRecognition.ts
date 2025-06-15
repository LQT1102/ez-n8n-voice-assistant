import { useState, useEffect, useCallback, useRef } from "react";
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "../types";

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setFakeTranscript: (text: string) => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const errorTimeoutRef = useRef<number | null>(null);

  // Kiểm tra xem trình duyệt có hỗ trợ Speech Recognition không
  const isSupported = !!(typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));

  // Khởi tạo Speech Recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN"; // Thiết lập ngôn ngữ tiếng Việt

    // Xử lý kết quả nhận dạng giọng nói
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Cập nhật transcript real-time
      const newTranscript = finalTranscript + interimTranscript;
      setTranscript(newTranscript);

      // Clear error timeout nếu có transcript
      if (newTranscript.trim() && errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };

    // Xử lý lỗi
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);

      let errorMessage = "";
      switch (event.error) {
        case "no-speech":
          errorMessage = "Không nghe thấy giọng nói. Đang sử dụng dữ liệu mẫu...";
          break;
        case "audio-capture":
          errorMessage = "Không thể truy cập microphone. Đang sử dụng dữ liệu mẫu...";
          break;
        case "not-allowed":
          errorMessage = "Quyền truy cập microphone bị từ chối. Đang sử dụng dữ liệu mẫu...";
          break;
        case "network":
          errorMessage = "Lỗi mạng. Đang sử dụng dữ liệu mẫu...";
          break;
        default:
          errorMessage = `Lỗi nhận dạng giọng nói: ${event.error}. Đang sử dụng dữ liệu mẫu...`;
      }

      setError(errorMessage);
      setIsListening(false);

      // Tự động đẩy fake data sau 2 giây
      errorTimeoutRef.current = setTimeout(() => {
        setTranscript("Thời tiết hôm nay là bao nhiêu độ");
        setError(null);
        errorTimeoutRef.current = null;
      }, 2000);
    };

    // Xử lý khi kết thúc
    recognition.onend = () => {
      setIsListening(false);
    };

    // Xử lý khi bắt đầu
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);

      // Clear any existing error timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [isSupported]);

  // Bắt đầu lắng nghe
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      const errorMsg = "Không thể bắt đầu nhận dạng giọng nói. Đang sử dụng dữ liệu mẫu...";
      setError(errorMsg);

      // Tự động đẩy fake data sau 2 giây
      errorTimeoutRef.current = setTimeout(() => {
        setTranscript("Thời tiết hôm nay là bao nhiêu độ");
        setError(null);
        errorTimeoutRef.current = null;
      }, 2000);
    }
  }, [isListening]);

  // Dừng lắng nghe
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error("Error stopping speech recognition:", err);
    }

    // Clear error timeout khi dừng
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);

    // Clear error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  // Set fake transcript (để test hoặc fallback)
  const setFakeTranscript = useCallback((text: string) => {
    setTranscript(text);
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setFakeTranscript,
  };
};
