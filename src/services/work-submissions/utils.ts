// Work Submissions Utils
// Helper functions untuk work submission module

import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { SubmissionStatus, WorkSubmission, WorkSubmissionListItem } from './types';

/**
 * Get label bahasa Indonesia untuk status submission
 */
export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
  };
  return labels[status] || status;
}

/**
 * Get badge color class untuk status submission
 */
export function getSubmissionStatusBadgeColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-primary/10 text-primary',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

/**
 * Get text color class untuk status submission (tanpa background)
 */
export function getSubmissionStatusTextColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    draft: 'text-muted-foreground',
    submitted: 'text-primary',
  };
  return colors[status] || 'text-muted-foreground';
}

// ==================== Formatting Helpers ====================

/**
 * Format tanggal submission month
 * Contoh: 2025-11-01 -> "November 2025"
 */
export function formatSubmissionMonth(date: string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = parseISO(date);
    return format(dateObj, 'MMMM yyyy', { locale: idLocale });
  } catch (error) {
    console.error('Error formatting submission month:', error);
    return '-';
  }
}

/**
 * Format tanggal lengkap
 */
export function formatSubmissionDate(date: string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = parseISO(date);
    return format(dateObj, 'dd MMMM yyyy', { locale: idLocale });
  } catch (error) {
    console.error('Error formatting submission date:', error);
    return '-';
  }
}

/**
 * Format datetime submission
 */
export function formatSubmissionDateTime(date: string | null | undefined): string {
  if (!date) return '-';

  try {
    const dateObj = parseISO(date);
    return format(dateObj, 'dd MMMM yyyy HH:mm', { locale: idLocale });
  } catch (error) {
    console.error('Error formatting submission datetime:', error);
    return '-';
  }
}

/**
 * Format file size dari bytes ke string readable
 * Contoh: 1024 -> "1 KB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format tampilan submission lengkap
 */
export function formatSubmissionDisplay(
  submission: WorkSubmission | WorkSubmissionListItem,
): string {
  const month = formatSubmissionMonth(submission.submission_month);
  const status = getSubmissionStatusLabel(submission.status);
  return `${submission.title} - ${month} (${status})`;
}

// ==================== State Check Helpers ====================

/**
 * Check apakah submission masih draft
 */
export function isDraft(submission: WorkSubmission | WorkSubmissionListItem): boolean {
  return submission.status === 'draft';
}

/**
 * Check apakah submission sudah submitted
 */
export function isSubmitted(submission: WorkSubmission | WorkSubmissionListItem): boolean {
  return submission.status === 'submitted';
}

/**
 * Check apakah submission bisa diedit (hanya draft yang bisa diedit)
 */
export function canEditSubmission(submission: WorkSubmission | WorkSubmissionListItem): boolean {
  return isDraft(submission);
}

/**
 * Check apakah submission bisa dihapus (hanya draft yang bisa dihapus)
 */
export function canDeleteSubmission(submission: WorkSubmission | WorkSubmissionListItem): boolean {
  return isDraft(submission);
}

// ==================== Validation Helpers ====================

/**
 * Validasi format file yang diupload
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, PNG, JPG, atau ZIP.',
    };
  }

  return { valid: true };
}

/**
 * Validasi ukuran file yang diupload (max 10 MB)
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10 MB in bytes

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal 10 MB. (File: ${formatFileSize(file.size)})`,
    };
  }

  return { valid: true };
}

/**
 * Validasi jumlah file yang diupload (max 10 files)
 */
export function validateFileCount(
  currentFilesCount: number,
  newFilesCount: number,
): { valid: boolean; error?: string } {
  const maxFiles = 10;
  const totalFiles = currentFilesCount + newFilesCount;

  if (totalFiles > maxFiles) {
    return {
      valid: false,
      error: `Maksimal ${maxFiles} file per submission. Saat ini: ${currentFilesCount}, menambahkan: ${newFilesCount}.`,
    };
  }

  return { valid: true };
}

/**
 * Validasi semua file yang akan diupload
 */
export function validateFiles(
  files: File[],
  currentFilesCount: number = 0,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate file count
  const countValidation = validateFileCount(currentFilesCount, files.length);
  if (!countValidation.valid && countValidation.error) {
    errors.push(countValidation.error);
    return { valid: false, errors };
  }

  // Validate each file
  files.forEach((file, index) => {
    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid && typeValidation.error) {
      errors.push(`File ${index + 1} (${file.name}): ${typeValidation.error}`);
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid && sizeValidation.error) {
      errors.push(`File ${index + 1} (${file.name}): ${sizeValidation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================== Date Helpers ====================

/**
 * Get first day of month dari date string
 * Untuk normalize submission_month
 */
export function getFirstDayOfMonth(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1), 'yyyy-MM-dd');
}

/**
 * Get current month first day untuk default submission_month
 */
export function getCurrentMonthFirstDay(): string {
  const now = new Date();
  return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
}
