# EZ n8n Voice Assistant

Một ứng dụng React hiện đại cho phép tương tác bằng giọng nói với n8n thông qua Speech-to-Text và HTTP response trực tiếp, với hệ thống xác thực API key.

## ✨ Tính năng chính

- 🔐 **Xác thực API Key**: Hệ thống login bằng API key để bảo mật
- 🎤 **Ghi âm giọng nói**: Sử dụng Web Speech API để chuyển đổi giọng nói thành văn bản
- 📤 **Gửi tin nhắn**: Gửi văn bản đã chuyển đổi tới n8n workflow qua webhook với API key
- 📡 **Nhận phản hồi trực tiếp**: Nhận phản hồi ngay lập tức từ n8n qua HTTP response
- 💬 **Giao diện chat**: Hiển thị cuộc trò chuyện giữa người dùng và assistant
- ⚙️ **Cấu hình linh hoạt**: Dễ dàng thay đổi URL webhook của n8n
- 📱 **Responsive**: Giao diện thân thiện trên mọi thiết bị
- 🚪 **Đăng xuất an toàn**: Xóa API key và reset session

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 18+ với TypeScript
- **Build Tool**: Vite (thay vì Create React App)
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios
- **Speech Recognition**: Web Speech API
- **Backend Integration**: n8n workflows với HTTP response

## 📋 Yêu cầu hệ thống

- Node.js 16+ 
- npm hoặc yarn
- Trình duyệt hiện đại hỗ trợ Web Speech API (Chrome, Edge, Firefox)
- n8n instance đang chạy

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd ez-n8n-voice-assistant
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình environment variables

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa .env với URL n8n của bạn
# VITE_N8N_WEBHOOK_URL=http://your-n8n-instance:5678/webhook/voice-assistant
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### 5. Build cho production

```bash
npm run build
```

### 6. Preview build

```bash
npm run preview
```

## 🔒 Authentication Flow

1. **Trang Login**: Khi vào ứng dụng lần đầu, người dùng nhập API key
2. **Lưu trữ bảo mật**: API key được lưu trong localStorage của trình duyệt
3. **Tự động đăng nhập**: Lần truy cập sau sẽ tự động đăng nhập nếu có key hợp lệ
4. **Header authentication**: Mọi request tới n8n đều có header `key` chứa API key
5. **Đăng xuất**: Xóa API key và tất cả dữ liệu session

## 🎯 Cách sử dụng

1. **Mở ứng dụng** tại `http://localhost:3000`

2. **Đăng nhập với API Key**:
   - Nhập API key hợp lệ (tối thiểu 4 ký tự)
   - Nhấn "Đăng nhập"
   - Key sẽ được lưu trong trình duyệt

3. **Cấu hình n8n URL** (nếu cần):
   - Nhấn nút ⚙️ ở góc phải trên
   - Nhập Webhook URL của n8n
   - Nhấn "Lưu cấu hình"

4. **Bắt đầu sử dụng**:
   - Nhấn nút microphone màu xanh để ghi âm
   - Hoặc nhập text trực tiếp
   - Tin nhắn sẽ được gửi kèm API key tới n8n
   - Phản hồi hiển thị ngay lập tức

5. **Đăng xuất**:
   - Nhấn nút "Đăng xuất" ở header
   - API key và dữ liệu session sẽ bị xóa

## 🔧 Cấu hình nâng cao

### Environment Variables

Tạo file `.env` trong thư mục gốc (copy từ `.env.example`):

```env
# N8n Configuration
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/voice-assistant

# Development Configuration
VITE_DEV_MODE=true
```

**Lưu ý:** 
- Vite sử dụng prefix `VITE_` cho environment variables
- File `.env` không được commit (đã có trong `.gitignore`)
- Sử dụng `.env.example` làm template

### Tùy chỉnh Speech Recognition

Trong file `src/hooks/useSpeechRecognition.ts`, bạn có thể thay đổi:

```typescript
recognition.lang = 'vi-VN'; // Thay đổi ngôn ngữ
recognition.continuous = true; // Ghi âm liên tục
recognition.interimResults = true; // Hiển thị kết quả tạm thời
```

## 🐛 Xử lý lỗi thường gặp

### 1. Lỗi "API key không hợp lệ"
- Kiểm tra API key đã được thêm vào n8n workflow chưa
- Đảm bảo key nhập đúng (không có space thừa)
- Kiểm tra n8n workflow có validate key đúng không

### 2. Lỗi "Không có quyền truy cập" 
- API key có thể đã hết hạn hoặc bị vô hiệu
- Liên hệ admin để cấp key mới

### 3. Các lỗi khác tương tự phiên bản trước
- Xem phần troubleshooting cũ...

## 📁 Cấu trúc dự án

```
src/
├── components/          # React components
│   ├── VoiceRecorder.tsx    # Component ghi âm
│   ├── MessageList.tsx      # Component hiển thị tin nhắn
│   └── ConfigPanel.tsx      # Component cấu hình
├── hooks/              # Custom React hooks
│   ├── useSpeechRecognition.ts  # Hook xử lý speech recognition
│   └── useN8nIntegration.ts     # Hook tích hợp n8n
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Component chính
└── main.tsx            # Entry point (Vite)
```

## 🔒 Bảo mật

- **API Key Authentication**: Mọi request đều yêu cầu API key hợp lệ
- **localStorage Security**: API key lưu local, không gửi qua network không cần thiết
- **Automatic Logout**: Có thể đăng xuất và xóa key bất kỳ lúc nào
- **Masked Display**: API key chỉ hiển thị 6 ký tự đầu + ***
- **HTTPS Required**: Sử dụng HTTPS trong production để bảo vệ API key
- **Input Validation**: Validate API key format trước khi gửi
- **Error Handling**: Xử lý lỗi 401/403 cho API key không hợp lệ

### API Key Best Practices

1. **Tạo key mạnh**: Sử dụng key ít nhất 8-16 ký tự, random
2. **Rotation**: Định kỳ thay đổi API key
3. **Scoping**: Tạo key riêng cho từng user/service nếu cần
4. **Monitoring**: Log các request với key để phát hiện abuse
5. **Revocation**: Có cơ chế vô hiệu hóa key khi cần

## 🚀 Triển khai Production

### Build và Deploy

```bash
# Build ứng dụng
npm run build

# Preview build
npm run preview

# Deploy tới hosting (ví dụ: Netlify, Vercel)
# Hoặc serve từ web server
npx serve -s dist
```

### Cấu hình HTTPS

Đảm bảo ứng dụng chạy qua HTTPS để Web Speech API hoạt động:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`

## ⚙️ Cấu hình n8n

### Webhook Endpoint với Authentication

Tạo một workflow trong n8n với:

1. **Webhook Trigger Node**:
   - HTTP Method: POST
   - Path: `/webhook/voice-assistant`
   - Response Mode: Respond to Webhook

2. **Function Node** (kiểm tra API key):
```javascript
// Lấy API key từ header
const apiKey = $request.headers['key'];
const command = $json.command;
const timestamp = $json.timestamp;
const userId = $json.userId;

// Kiểm tra API key (thay đổi theo logic của bạn)
const validApiKeys = [
  'your-secret-api-key-1',
  'your-secret-api-key-2',
  // Thêm các API key hợp lệ
];

if (!apiKey || !validApiKeys.includes(apiKey)) {
  // Trả về lỗi unauthorized
  $response.status(401).send('API key không hợp lệ');
  return;
}

// Log để debug
console.log('Authenticated request with key:', apiKey.substring(0, 6) + '***');
console.log('Received command:', command);

// Xử lý logic nghiệp vụ ở đây
let response = '';

if (command.toLowerCase().includes('xin chào') || command.toLowerCase().includes('hello')) {
  response = 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn?';
} else if (command.toLowerCase().includes('thời tiết')) {
  response = 'Tôi chưa thể kiểm tra thời tiết ngay bây giờ, nhưng bạn có thể kiểm tra trên ứng dụng thời tiết của mình.';
} else if (command.toLowerCase().includes('cảm ơn')) {
  response = 'Không có gì! Tôi luôn sẵn sàng giúp đỡ bạn.';
} else if (command.toLowerCase().includes('tạm biệt') || command.toLowerCase().includes('bye')) {
  response = 'Tạm biệt! Hẹn gặp lại bạn sau nhé!';
} else {
  response = `Tôi đã nghe bạn nói: "${command}". Đây là phản hồi tự động từ n8n workflow.`;
}

// Trả về response với thông tin user
return {
  message: response,
  originalCommand: command,
  timestamp: new Date().toISOString(),
  userId: userId,
  authenticatedUser: apiKey.substring(0, 6) + '***',
  processed: true
};
```

3. **Respond to Webhook Node**:
   - Respond With: Text
   - Response Body: `{{ $json.message }}`
   - Headers: 
     - `Content-Type`: `text/plain; charset=utf-8`
     - `Access-Control-Allow-Origin`: `*`