export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
}

export const SUBMISSION_STATUS_OPTIONS = [
  { value: SubmissionStatus.DRAFT, label: 'Draft' },
  { value: SubmissionStatus.SUBMITTED, label: 'Submitted' },
] as const;

/**
 * Metadata untuk file yang diupload
 */
export interface FileMetadata {
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_url?: string;
}
