import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
    Assignment,
    AssignmentCreateRequest,
    AssignmentFilterParams,
} from './types';

/**
 * Assignments Service Class
 * HRIS v2 - Manajemen penggantian sementara karyawan
 */
class AssignmentsService extends BaseService {
    constructor() {
        super('/assignments');
    }

    /**
     * POST /assignments
     * Membuat assignment baru
     */
    async createAssignment(request: AssignmentCreateRequest): Promise<ApiResponse<Assignment>> {
        return this.post<ApiResponse<Assignment>>('', request);
    }

    /**
     * GET /assignments
     * List assignments dengan pagination dan filter
     */
    async getAssignments(
        params?: PaginationParams & AssignmentFilterParams
    ): Promise<PaginatedApiResponse<Assignment>> {
        return this.get<PaginatedApiResponse<Assignment>>('', { params });
    }

    /**
     * GET /assignments/{id}
     * Get assignment by ID
     */
    async getAssignment(id: number): Promise<ApiResponse<Assignment>> {
        return this.get<ApiResponse<Assignment>>(`/${id}`);
    }

    /**
     * POST /assignments/{id}/cancel
     * Batalkan assignment
     */
    async cancelAssignment(id: number): Promise<ApiResponse<Assignment>> {
        return this.post<ApiResponse<Assignment>>(`/${id}/cancel`);
    }
}

export const assignmentsService = new AssignmentsService();
export default assignmentsService;
