import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
  field?: string;
}

export interface ErrorHandlerOptions {
  customMessage?: string;
  silent?: boolean;
}

export class ApiErrorHandler {
  private static getErrorMessage(error: AxiosError): string {
    const data = error.response?.data as any;

    if (data?.message) {
      return data.message;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.error) {
      return data.error;
    }

    switch (error.response?.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public static handle(error: unknown, options: ErrorHandlerOptions = {}): ApiError {
    const { customMessage, silent = false } = options;

    if (!error) {
      return { status: 0, message: 'Unknown error occurred' };
    }

    let apiError: ApiError;

    if (error instanceof AxiosError && error.response) {
      const message = customMessage || ApiErrorHandler.getErrorMessage(error);

      apiError = {
        status: error.response.status,
        message,
        details: error.response.data,
      };

    } else if (error instanceof Error) {
      apiError = {
        status: 0,
        message: customMessage || error.message || 'An unexpected error occurred',
      };

    } else {
      apiError = {
        status: 0,
        message: customMessage || 'An unexpected error occurred',
      };
    }

    if (!silent) {
      console.error('API Error:', apiError, error);
    }

    return apiError;
  }
}

export const handleApiError = ApiErrorHandler.handle;
