import React, { useState } from "react";
import { AppConfig } from "../types";

interface ConfigPanelProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange, isVisible, onToggleVisibility }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  // Xử lý thay đổi input
  const handleInputChange = (field: keyof AppConfig, value: string) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    setHasChanges(newConfig.n8nWebhookUrl !== config.n8nWebhookUrl);
  };

  // Lưu cấu hình
  const handleSave = () => {
    onConfigChange(localConfig);
    setHasChanges(false);

    // Lưu vào localStorage
    localStorage.setItem("n8n-voice-assistant-config", JSON.stringify(localConfig));
  };

  // Reset về cấu hình hiện tại
  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  // Load cấu hình mặc định
  const handleLoadDefaults = () => {
    const defaultConfig: AppConfig = {
      n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/voice-assistant",
    };
    setLocalConfig(defaultConfig);
    setHasChanges(defaultConfig.n8nWebhookUrl !== config.n8nWebhookUrl);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggleVisibility}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full 
                 shadow-lg hover:bg-gray-700 transition-colors focus:outline-none 
                 focus:ring-2 focus:ring-gray-500"
        title="Cấu hình"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Config Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Cấu hình n8n</h2>
              <button onClick={onToggleVisibility} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={localConfig.n8nWebhookUrl}
                  onChange={(e) => handleInputChange("n8nWebhookUrl", e.target.value)}
                  placeholder="http://localhost:5678/webhook/voice-assistant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL để gửi tin nhắn tới n8n workflow và nhận phản hồi trực tiếp
                </p>
              </div>

              {/* Status */}
              {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-yellow-700 text-sm">Có thay đổi chưa được lưu</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg 
                             hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    💾 Lưu cấu hình
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg 
                             hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    ↩️ Hoàn tác
                  </button>
                </div>

                <button
                  onClick={handleLoadDefaults}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg 
                           hover:bg-green-600 transition-colors focus:outline-none 
                           focus:ring-2 focus:ring-green-300"
                >
                  🔄 Tải cấu hình mặc định
                </button>
              </div>

              {/* Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Hướng dẫn</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Webhook URL: Endpoint để gửi tin nhắn và nhận phản hồi trực tiếp từ n8n</li>
                  <li>• n8n workflow sẽ xử lý tin nhắn và trả về phản hồi ngay lập tức</li>
                  <li>• Đảm bảo n8n đang chạy và endpoint đã được cấu hình</li>
                  <li>• Cấu hình sẽ được lưu trong trình duyệt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
