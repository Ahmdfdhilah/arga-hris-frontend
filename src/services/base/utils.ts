// Utility functions untuk services

import { PaginationParams } from './types';

/**
 * Build query string dari pagination params
 */
export const buildPaginationQuery = (params?: PaginationParams): string => {
  if (!params) return '';

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Extract error message from API error
 */
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Check if response is successful
 */
export const isSuccessResponse = (response: any): boolean => {
  return response && response.error === false;
};

/**
 * Check if response is error
 */
export const isErrorResponse = (response: any): boolean => {
  return response && response.error === true;
};
