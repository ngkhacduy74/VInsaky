import axios from "axios";

// Base URL for API calls - always use /api/v1 (proxied through React dev server)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// OTP verification
const verifyOTPApi = (email, otp) => {
  const data = {
    email: email,
    otp: otp,
  };
  console.log("Verifying OTP:", data);
  return apiClient.get("/otp/verifyOTP", { params: data });
};

// User authentication
const loginApi = (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

const registerApi = (userData) => {
  return apiClient.post("/auth/register", userData);
};

// User operations
const getUserProfile = () => {
  return apiClient.get("/user/profile");
};

const updateUserProfile = (userData) => {
  return apiClient.put("/user/profile", userData);
};

// Product operations
const getProducts = (params) => {
  return apiClient.get("/product", { params });
};

const getProductById = (id) => {
  return apiClient.get(`/product/${id}`);
};

// Post operations
const getPosts = (params) => {
  return apiClient.get("/post", { params });
};

const getPostById = (id) => {
  return apiClient.get(`/post/${id}`);
};

const createPost = (postData) => {
  return apiClient.post("/post", postData);
};

// File upload
const uploadFile = (formData, onUploadProgress) => {
  return apiClient.post("/file/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

// Order operations
const checkoutOrder = (orderData) => {
  return apiClient.post("/orders/checkout", orderData);
};

const checkOrderStatus = (invoice) => {
  return apiClient.get(`/orders/invoice/${invoice}`);
};

export {
  verifyOTPApi,
  loginApi,
  registerApi,
  getUserProfile,
  updateUserProfile,
  getProducts,
  getProductById,
  getPosts,
  getPostById,
  createPost,
  uploadFile,
  checkoutOrder,
  checkOrderStatus,
  apiClient,
};

export default apiClient;
