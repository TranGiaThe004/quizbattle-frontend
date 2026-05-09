import axios from 'axios';

// Tạo một instance của axios với URL mặc định
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// INTERCEPTOR 1: Tự động nhét access_token vào hành lý (Header) trước khi gửi đi
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// INTERCEPTOR 2: Bắt lỗi 401 và tự động gọi Refresh Token
api.interceptors.response.use(
  (response) => response, // Nếu gọi API thành công -> cho qua bình thường
  async (error) => {
    const originalRequest = error.config;

    // Nếu server báo lỗi 401 (Hết hạn Access Token) và chưa thử refresh lại lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đang thử gọi lại, tránh bị lặp vô hạn
      
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
          try {
            // 1. Gọi API xin thẻ Access Token mới
            const res = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
              refresh_token: refreshToken
            });

            // 2. Lấy thẻ mới thành công -> Lưu vào localStorage
            const newAccessToken = res.data.access_token;
            localStorage.setItem("access_token", newAccessToken);

            // 3. Thay thẻ mới vào cái request ban đầu vừa bị lỗi, và gửi lại
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
            
          } catch (refreshError) {
            // Bị lỗi ở đây tức là Refresh Token cũng đã hết hạn hoặc bị Backend thu hồi
            // -> Dọn sạch localStorage và đá văng ra màn hình đăng nhập
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
        } else {
          // Không có Refresh Token trong máy -> Đá ra login luôn
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;