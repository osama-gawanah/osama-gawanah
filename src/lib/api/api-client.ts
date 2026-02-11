import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Configuration for the API client
 */
type ApiClientConfig = {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
};

/**
 * Standard API response wrapper
 */
type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

/**
 * API error structure
 */
type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};

const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
};

/**
 * Creates and configures an Axios instance for API calls
 */
function createApiClient(config: Partial<ApiClientConfig> = {}): AxiosInstance {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const instance = axios.create({
    baseURL: mergedConfig.baseURL,
    timeout: mergedConfig.timeout,
    headers: mergedConfig.headers
  });

  instance.interceptors.request.use(
    (requestConfig) => {
      const token = getAuthToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const apiError = handleApiError(error);
      return Promise.reject(apiError);
    }
  );

  return instance;
}

/**
 * Retrieves auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Sets auth token in storage
 */
function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

/**
 * Removes auth token from storage
 */
function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

/**
 * Handles API errors and transforms them into a consistent format
 */
function handleApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response) {
    return {
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
      errors: error.response.data?.errors
    };
  }

  if (error.request) {
    return {
      message: "Network error. Please check your connection.",
      status: 0
    };
  }

  return {
    message: error.message || "An unexpected error occurred",
    status: 0
  };
}

const apiClient = createApiClient();

/**
 * API service with typed methods for HTTP operations
 */
const apiService = {
  /**
   * GET request
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await apiClient.get(url, config);
    return {
      data: response.data,
      status: response.status
    };
  },

  /**
   * POST request
   */
  post: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await apiClient.post(url, data, config);
    return {
      data: response.data,
      status: response.status
    };
  },

  /**
   * PUT request
   */
  put: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await apiClient.put(url, data, config);
    return {
      data: response.data,
      status: response.status
    };
  },

  /**
   * PATCH request
   */
  patch: async <T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await apiClient.patch(url, data, config);
    return {
      data: response.data,
      status: response.status
    };
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response: AxiosResponse<T> = await apiClient.delete(url, config);
    return {
      data: response.data,
      status: response.status
    };
  }
};

export {
  apiService,
  apiClient,
  createApiClient,
  setAuthToken,
  removeAuthToken,
  getAuthToken
};

export type { ApiResponse, ApiError, ApiClientConfig };

