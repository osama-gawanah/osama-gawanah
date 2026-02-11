export {
  apiService,
  apiClient,
  createApiClient,
  setAuthToken,
  removeAuthToken,
  getAuthToken
} from "./api-client";

export type { ApiResponse, ApiError, ApiClientConfig } from "./api-client";

export { createQueryClient, getQueryClient } from "./query-client";

export {
  useApiQuery,
  useApiMutation,
  useApiPutMutation,
  useApiPatchMutation,
  useApiDeleteMutation
} from "./hooks/use-api-query";

export { useAiAsk } from "./hooks/use-ai-ask";
export type { AskRequest, AskResponse } from "./hooks/use-ai-ask";

