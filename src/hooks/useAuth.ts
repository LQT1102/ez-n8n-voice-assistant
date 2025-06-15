import { useState, useEffect, useCallback } from "react";
import { AuthState } from "../types";

const AUTH_STORAGE_KEY = "n8n-voice-assistant-auth";

interface UseAuthReturn {
  authState: AuthState;
  login: (apiKey: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    apiKey: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load auth state từ localStorage khi khởi tạo
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsedAuth: AuthState = JSON.parse(savedAuth);
        if (parsedAuth.apiKey && parsedAuth.apiKey.trim().length >= 4) {
          setAuthState({
            isAuthenticated: true,
            apiKey: parsedAuth.apiKey,
          });
        }
      }
    } catch (error) {
      console.error("Error loading auth from localStorage:", error);
      // Clear invalid data
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // Login function
  const login = useCallback((apiKey: string) => {
    setIsLoading(true);

    // Simulate API validation (có thể thêm actual validation sau)
    setTimeout(() => {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        apiKey: apiKey.trim(),
      };

      setAuthState(newAuthState);

      // Lưu vào localStorage
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
      } catch (error) {
        console.error("Error saving auth to localStorage:", error);
      }

      setIsLoading(false);
    }, 1000); // 1 second delay để simulate authentication
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      apiKey: null,
    });

    // Xóa khỏi localStorage
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing auth from localStorage:", error);
    }
  }, []);

  return {
    authState,
    login,
    logout,
    isLoading,
  };
};
