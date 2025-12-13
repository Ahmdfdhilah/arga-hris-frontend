import { BaseService } from '../base/service';
import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationParams,
} from '../base/types';
import type {
  LeaveRequest,
  LeaveRequestWithEmployee,
  LeaveRequestCreateRequest,
  LeaveRequestUpdateRequest,
  LeaveRequestFilterParams,
} from './types';

class LeaveRequestsService extends BaseService {
  constructor() {
    super('/leave-requests');
  }

  async getMyLeaveRequests(
    params?: PaginationParams & LeaveRequestFilterParams,
  ): Promise<PaginatedApiResponse<LeaveRequestWithEmployee>> {
    return this.get<PaginatedApiResponse<LeaveRequestWithEmployee>>(
      '/my-leave-requests',
      params,
    );
  }

  async getTeamLeaveRequests(
    params?: PaginationParams & Omit<LeaveRequestFilterParams, 'employee_id'>,
  ): Promise<PaginatedApiResponse<LeaveRequestWithEmployee>> {
    return this.get<PaginatedApiResponse<LeaveRequestWithEmployee>>(
      '/team/leave-requests',
      params,
    );
  }

  async getLeaveRequests(
    params?: PaginationParams & LeaveRequestFilterParams,
  ): Promise<PaginatedApiResponse<LeaveRequestWithEmployee>> {
    return this.get<PaginatedApiResponse<LeaveRequestWithEmployee>>('', params);
  }

  async getLeaveRequest(
    id: number,
  ): Promise<ApiResponse<LeaveRequest>> {
    return this.get<ApiResponse<LeaveRequest>>(`/${id}`);
  }

  async createLeaveRequest(
    request: LeaveRequestCreateRequest,
  ): Promise<ApiResponse<LeaveRequest>> {
    return this.post<ApiResponse<LeaveRequest>>('', request);
  }

  async updateLeaveRequest(
    id: number,
    request: LeaveRequestUpdateRequest,
  ): Promise<ApiResponse<LeaveRequest>> {
    return this.put<ApiResponse<LeaveRequest>>(`/${id}`, request);
  }

  async deleteLeaveRequest(id: number): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/${id}`);
  }
}

export const leaveRequestsService = new LeaveRequestsService();
export default leaveRequestsService;
