import type { FileMetadata, SubmissionStatus } from './shared';

/**
 * Response schema untuk work submission detail
 * Mapping dari WorkSubmissionResponse di backend
 */
export interface WorkSubmission {
  id: number;
  employee_id: number;
  submission_month: string; // ISO date format
  title: string;
  description: string;
  files: FileMetadata[];
  status: SubmissionStatus;
  submitted_at: string | null; // ISO datetime format
  created_by: number | null;
  created_at: string; // ISO datetime format
  updated_at: string; // ISO datetime format
}

/**
 * Response schema untuk work submission list dengan employee info
 * Mapping dari WorkSubmissionListResponse di backend
 */
export interface WorkSubmissionListItem {
  id: number;
  employee_id: number;
  employee_name: string | null;
  employee_number: string | null;
  submission_month: string; // ISO date format
  title: string;
  files_count: number;
  status: SubmissionStatus;
  submitted_at: string | null; // ISO datetime format
  created_at: string; // ISO datetime format
  updated_at: string; // ISO datetime format
}
