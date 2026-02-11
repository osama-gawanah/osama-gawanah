import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey
} from "@tanstack/react-query";
import { apiService, ApiResponse, ApiError } from "../api-client";

/**
 * Custom hook for GET requests with React Query
 */
function useApiQuery<T>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<ApiResponse<T>, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<ApiResponse<T>, ApiError>({
    queryKey,
    queryFn: () => apiService.get<T>(url),
    ...options
  });
}

/**
 * Custom hook for POST mutations with React Query
 */
function useApiMutation<T, D = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, ApiError, D>, "mutationFn">
) {
  return useMutation<ApiResponse<T>, ApiError, D>({
    mutationFn: (data: D) => apiService.post<T, D>(url, data),
    ...options
  });
}

/**
 * Custom hook for PUT mutations with React Query
 */
function useApiPutMutation<T, D = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, ApiError, D>, "mutationFn">
) {
  return useMutation<ApiResponse<T>, ApiError, D>({
    mutationFn: (data: D) => apiService.put<T, D>(url, data),
    ...options
  });
}

/**
 * Custom hook for PATCH mutations with React Query
 */
function useApiPatchMutation<T, D = unknown>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, ApiError, D>, "mutationFn">
) {
  return useMutation<ApiResponse<T>, ApiError, D>({
    mutationFn: (data: D) => apiService.patch<T, D>(url, data),
    ...options
  });
}

/**
 * Custom hook for DELETE mutations with React Query
 */
function useApiDeleteMutation<T>(
  url: string,
  options?: Omit<UseMutationOptions<ApiResponse<T>, ApiError, void>, "mutationFn">
) {
  return useMutation<ApiResponse<T>, ApiError, void>({
    mutationFn: () => apiService.delete<T>(url),
    ...options
  });
}

export {
  useApiQuery,
  useApiMutation,
  useApiPutMutation,
  useApiPatchMutation,
  useApiDeleteMutation
};

