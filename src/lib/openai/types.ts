export type LengthPreference = 'short' | 'medium' | 'long';

export interface GenerateOptions {
  maxRetries?: number;
  retryDelay?: number;
  stream?: boolean;
  onProgress?: ProgressCallback;
}

export type ProgressCallback = (content: string) => void;

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    code: string;
    param?: string;
  };
}