// Work Submissions Service
// Menangani operasi work submission management

import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  WorkSubmission,
  WorkSubmissionListItem,
  WorkSubmissionCreateRequest,
  WorkSubmissionUpdateRequest,
  WorkSubmissionFilterParams,
} from './types';

/**
 * Work Submissions Service Class
 * Menangani operasi work submission management sesuai dengan backend HRIS
 */
class WorkSubmissionsService extends BaseService {
  constructor() {
    super('/work-submissions');
  }

  // ==================== Employee Self Service ====================

  /**
   * GET /work-submissions/my-submissions
   * Ambil daftar work submissions employee sendiri
   *
   * Employee hanya bisa melihat submission miliknya sendiri.
   *
   * Requires permission: work_submission.read_own
   */
  async getMySubmissions(
    params?: PaginationParams & WorkSubmissionFilterParams,
  ): Promise<PaginatedApiResponse<WorkSubmission>> {
    return this.get<PaginatedApiResponse<WorkSubmission>>(
      '/my-submissions',
      { params },
    );
  }

  /**
   * POST /work-submissions/
   * Membuat work submission baru
   *
   * Note: Files diupload terpisah menggunakan endpoint upload files.
   *
   * Requires permission: work_submission.create
   */
  async createSubmission(
    request: WorkSubmissionCreateRequest,
  ): Promise<ApiResponse<WorkSubmission>> {
    return this.post<ApiResponse<WorkSubmission>>('/', request);
  }

  // ==================== Admin Operations ====================

  /**
   * GET /work-submissions/
   * Ambil daftar semua work submissions (HR Admin/Super Admin only)
   *
   * Requires permission: work_submission.read_all
   */
  async getAllSubmissions(
    params?: PaginationParams & WorkSubmissionFilterParams,
  ): Promise<PaginatedApiResponse<WorkSubmissionListItem>> {
    return this.get<PaginatedApiResponse<WorkSubmissionListItem>>('', {
      params,
    });
  }

  /**
   * GET /work-submissions/{id}
   * Ambil detail work submission berdasarkan ID
   *
   * Requires permission: work_submission.read
   */
  async getSubmissionById(id: number): Promise<ApiResponse<WorkSubmission>> {
    return this.get<ApiResponse<WorkSubmission>>(`/${id}`);
  }

  /**
   * PUT /work-submissions/{id}
   * Update work submission
   *
   * Requires permission: work_submission.update
   */
  async updateSubmission(
    id: number,
    request: WorkSubmissionUpdateRequest,
  ): Promise<ApiResponse<WorkSubmission>> {
    return this.put<ApiResponse<WorkSubmission>>(`/${id}`, request);
  }

  /**
   * DELETE /work-submissions/{id}
   * Hapus work submission beserta semua files-nya
   *
   * Requires permission: work_submission.delete
   */
  async deleteSubmission(id: number): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }

  // ==================== File Operations ====================

  /**
   * POST /work-submissions/{id}/upload-files
   * Upload files ke work submission
   *
   * Supported file types: PDF, Word, Excel, PowerPoint, Images (PNG, JPG), ZIP
   * Max file size: 10 MB per file
   * Max files: 10 files per submission
   *
   * Requires permission: work_submission.upload_files
   */
  async uploadFiles(
    submissionId: number,
    files: File[],
  ): Promise<ApiResponse<WorkSubmission>> {
    const formData = new FormData();

    // Append multiple files
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.post<ApiResponse<WorkSubmission>>(
      `/${submissionId}/upload-files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  /**
   * DELETE /work-submissions/{id}/files
   * Hapus single file dari work submission
   *
   * Requires permission: work_submission.delete_file
   */
  async deleteFile(
    submissionId: number,
    filePath: string,
  ): Promise<ApiResponse<WorkSubmission>> {
    const response = await this.api.request<ApiResponse<WorkSubmission>>({
      method: 'DELETE',
      url: `${this.basePath}/${submissionId}/files`,
      data: { file_path: filePath },
    });
    return response.data;
  }
}

// Export singleton instance
export const workSubmissionsService = new WorkSubmissionsService();
export default workSubmissionsService;
