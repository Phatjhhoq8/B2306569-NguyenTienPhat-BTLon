import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Quan trọng: Cho phép gửi và nhận HTTP-Only Cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm interceptor xử lý lỗi tập trung nếu cần
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

export default api;
