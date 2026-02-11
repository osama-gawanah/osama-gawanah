import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ApiError } from "../api-client";

/**
 * Request payload for the AI ask endpoint
 */
type AskRequest = {
  question: string;
  history: Array<Record<string, unknown>>;
};

/**
 * Response from the AI ask endpoint
 */
type AskResponse = {
  answer: string;
};

/**
 * Custom hook for AI ask endpoint
 */
function useAiAsk(
  options?: Omit<
    UseMutationOptions<AskResponse, ApiError, AskRequest>,
    "mutationFn"
  >
) {
  return useMutation<AskResponse, ApiError, AskRequest>({
    mutationFn: async (data: AskRequest) => {
      const response = await axios.post<AskResponse>(
        "https://ai-osama-gawanh.onrender.com/ask",
        data,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    },
    ...options
  });
}

export { useAiAsk };
export type { AskRequest, AskResponse };

