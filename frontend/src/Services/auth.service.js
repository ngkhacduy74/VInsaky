import axios from "axios";
import { notification } from "antd";

// Base URL for API calls - always use /api/v1 (proxied through React dev server)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '/api/v1';

// ---- Auto refresh access token if missing but refreshToken is present ----
(async () => {
  const storedToken = localStorage.getItem("token");
  const storedRefresh = localStorage.getItem("refreshToken");
  if (!storedToken && storedRefresh) {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken: storedRefresh });
      // NestJS format: { success, data: { accessToken, refreshToken, user } }
      const data = res.data?.data;
      if (res.data?.success && data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn("Auto refresh on load failed", err);
    }
  }
})();


// Create axios instance with default config
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create public API client for routes that don't require authentication
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with token refresh
authApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (refreshToken) {
          // NestJS format: { success, data: { accessToken, refreshToken, user } }
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          const newData = refreshResponse.data?.data;
          if (refreshResponse.data?.success && newData?.accessToken) {
            localStorage.setItem("token", newData.accessToken);
            if (newData.refreshToken) localStorage.setItem("refreshToken", newData.refreshToken);
            if (newData.user) localStorage.setItem("user", JSON.stringify(newData.user));
            
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newData.accessToken}`;
            
            // Retry the original request
            return authApiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // If refresh failed or no refresh token, clear auth data but don't redirect
      // Let the component handle the 401 error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("refresh_token");
    }

    return Promise.reject(error);
  }
);

// Function to handle token expiration
const handleTokenExpired = () => {
  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refresh_token");

  // Show notification to user
  notification.warning({
    message: "Phiên đăng nhập hết hạn",
    description: "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
    duration: 3,
  });

  // Redirect to login page
  window.location.href = "/login";
};

// Function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Function to get current user data
const getCurrentUser = () => {
  try {
    let userData = localStorage.getItem("user");
    if (!userData) {
      // Nếu chưa có user trong localStorage, thử lấy từ token
      const token = localStorage.getItem("token");
      if (token) {
        // Giải mã payload của JWT (không kiểm tra chữ ký)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.user) {
          userData = JSON.stringify(payload.user);
          localStorage.setItem("user", userData);
        } else if (payload && payload.email) {
          userData = JSON.stringify(payload);
          localStorage.setItem("user", userData);
        }
      }
    }
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Function to logout user
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("refresh_token");
  
  notification.success({
    message: "Đăng xuất thành công",
    description: "Bạn đã được đăng xuất khỏi hệ thống.",
    duration: 2,
  });

  window.location.href = "/login";
};

// Function to validate token and get user info
const validateToken = async () => {
  try {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      return { isValid: false, user: null };
    }

    // Decode JWT payload (no signature check - just check expiry)
    let payload;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return { isValid: false, user: null };
    }

    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired → try refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });
          // NestJS format: { success, data: { accessToken, refreshToken, user } }
          const newData = refreshRes.data?.data;
          const newToken = newData?.accessToken;
          if (refreshRes.data?.success && newToken) {
            localStorage.setItem("token", newToken);
            if (newData?.refreshToken) localStorage.setItem("refreshToken", newData.refreshToken);
            if (newData?.user) localStorage.setItem("user", JSON.stringify(newData.user));
            const newPayload = JSON.parse(atob(newToken.split('.')[1]));
            const refreshedUser = newData?.user || newPayload?.user || JSON.parse(userData || 'null');
            if (refreshedUser) localStorage.setItem("user", JSON.stringify(refreshedUser));
            return { isValid: true, user: refreshedUser };
          }
        } catch (e) {
          console.warn("Token refresh failed:", e.message);
        }
      }
      return { isValid: false, user: null };
    }

    // Token còn hạn → valid, lấy user từ localStorage (đã lưu khi login)
    const storedUser = userData ? JSON.parse(userData) : (payload.user || null);
    if (!storedUser) {
      return { isValid: false, user: null };
    }

    return { isValid: true, user: storedUser };
  } catch (error) {
    console.warn("validateToken error:", error.message);
    // Fallback: giữ user nếu có
    const storedUser = localStorage.getItem("user");
    return {
      isValid: !!storedUser,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  }
};



// Export the auth client and utility functions
export {
  authApiClient,
  publicApiClient,
  handleTokenExpired,
  isAuthenticated,
  getCurrentUser,
  logout,
  validateToken
};