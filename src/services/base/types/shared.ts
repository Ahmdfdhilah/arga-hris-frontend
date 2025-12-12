// Shared types untuk request dan response

/**
 * Base API Response structure dari backend
 */
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  timestamp: string; // ISO 8601 format
  data: T;
}

/**
 * Paginated API Response structure dari backend
 */
export interface PaginatedApiResponse<T = any> {
  error: boolean;
  message: string;
  timestamp: string;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_prev_page: boolean;
  has_next_page: boolean;
}

/**
 * Pagination request params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Base entity with timestamps
 */
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  error: true;
  message: string;
  timestamp: string;
  data?: any;
  detail?: string;
  errors?: Record<string, string[]>;
}
