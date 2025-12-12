import type { SubmissionStatus } from './shared';

/**
 * Request schema untuk membuat work submission baru
 * Mapping dari WorkSubmissionCreateRequest di backend
 */
export interface WorkSubmissionCreateRequest {
  employee_id: number;
  submission_month: string; // format: YYYY-MM-DD
  title: string;
  description?: string;
  status?: SubmissionStatus;
}

/**
 * Request schema untuk update work submission
 * Mapping dari WorkSubmissionUpdateRequest di backend
 */
export interface WorkSubmissionUpdateRequest {
  title?: string;
  description?: string;
  status?: SubmissionStatus;
}

/**
 * Filter params untuk list work submissions
 */
export interface WorkSubmissionFilterParams {
  employee_id?: number;
  submission_month?: string; // format: YYYY-MM-DD
  status?: 'draft' | 'submitted';
}
