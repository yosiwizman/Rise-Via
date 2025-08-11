import { useState, useCallback } from 'react';
import { env } from '../config/env';

interface FlowiseResponse {
  text: string;
  sourceDocuments?: Record<string, unknown>[];
  chatHistory?: Record<string, unknown>[];
}

interface FlowiseError {
  message: string;
  status?: number;
}

export const useFlowise = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FlowiseError | null>(null);

  const callFlowise = useCallback(async (
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<FlowiseResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const flowiseUrl = env.FLOURISH_API_URL || 'http://localhost:3000';
      const apiKey = env.FLOURISH_API_KEY;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${flowiseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const error = err as Error;
      setError({
        message: error.message,
        status: 500
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const flowiseUrl = env.FLOURISH_API_URL || 'http://localhost:3000';
      const response = await fetch(`${flowiseUrl}/api/v1/ping`);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    callFlowise,
    testConnection,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};
