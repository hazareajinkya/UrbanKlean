import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Create axios instance with default configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 120000, // 2 minutes
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  (error) => {
    const { response, request, message } = error;

    if (response) {
      // Server responded with error status
      const { status, data } = response;

      console.error(
        `❌ API Error ${status}:`,
        data?.message || data || message
      );

      // Handle specific error cases
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          }
          break;
        case 403:
          console.error(
            "❌ Forbidden: You don't have permission to access this resource"
          );
          break;
        case 404:
          console.error("❌ Not Found: The requested resource was not found");
          break;
        case 500:
          console.error("❌ Server Error: Internal server error occurred");
          break;
        default:
          console.error(`❌ HTTP Error ${status}: ${data?.message || message}`);
      }

      return Promise.reject({
        status,
        message: data?.message || `HTTP Error ${status}`,
        data: data || null,
      });
    } else if (request) {
      // Network error
      console.error("❌ Network Error: No response received from server");
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        data: null,
      });
    } else {
      // Something else happened
      console.error("❌ Request Setup Error:", message);
      return Promise.reject({
        status: 0,
        message: message || "An unexpected error occurred",
        data: null,
      });
    }
  }
);

// Utility functions for common HTTP methods
export const apiClient = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => axiosClient.get(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => axiosClient.post(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => axiosClient.put(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => axiosClient.patch(url, data, config),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => axiosClient.delete(url, config),
};

export default axiosClient;
