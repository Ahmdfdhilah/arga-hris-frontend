import { BaseService } from '../base/service';
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from '../base/types';
import type {
  OrgUnit,
  OrgUnitHierarchy,
  OrgUnitTypes,
  CreateOrgUnitRequest,
  UpdateOrgUnitRequest,
  OrgUnitFilterParams,
} from './types';

class OrgUnitsService extends BaseService {
  constructor() {
    super('/org-units');
  }

  async getOrgUnit(orgUnitId: number): Promise<ApiResponse<OrgUnit>> {
    return this.get<ApiResponse<OrgUnit>>(`/${orgUnitId}`);
  }

  async getOrgUnitByCode(code: string): Promise<ApiResponse<OrgUnit | null>> {
    return this.get<ApiResponse<OrgUnit | null>>(`/by-code/${code}`);
  }

  async listOrgUnits(
    params?: PaginationParams & OrgUnitFilterParams
  ): Promise<PaginatedApiResponse<OrgUnit>> {
    return this.get<PaginatedApiResponse<OrgUnit>>('', { params });
  }

  async getOrgUnitChildren(
    orgUnitId: number,
    params?: PaginationParams
  ): Promise<PaginatedApiResponse<OrgUnit>> {
    return this.get<PaginatedApiResponse<OrgUnit>>(`/${orgUnitId}/children`, { params });
  }

  async getOrgUnitHierarchy(orgUnitId: number): Promise<ApiResponse<OrgUnitHierarchy>> {
    return this.get<ApiResponse<OrgUnitHierarchy>>(`/${orgUnitId}/hierarchy`);
  }

  async getOrgUnitTypes(): Promise<ApiResponse<OrgUnitTypes>> {
    return this.get<ApiResponse<OrgUnitTypes>>('/types/all');
  }

  async createOrgUnit(request: CreateOrgUnitRequest): Promise<ApiResponse<OrgUnit>> {
    return this.post<ApiResponse<OrgUnit>>('', request);
  }

  async updateOrgUnit(orgUnitId: number, request: UpdateOrgUnitRequest): Promise<ApiResponse<OrgUnit>> {
    return this.put<ApiResponse<OrgUnit>>(`/${orgUnitId}`, request);
  }

  async deleteOrgUnit(orgUnitId: number): Promise<ApiResponse<OrgUnit>> {
    return this.delete<ApiResponse<OrgUnit>>(`/${orgUnitId}`);
  }

  /**
   * POST /org-units/bulk-insert
   * Bulk insert org units from Excel
   */
  async bulkInsertOrgUnits(formData: FormData): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/bulk-insert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Restore archived org unit
   * Restores org unit in workforce service
   * Validates parent is not deleted
   * Requires org_unit.restore permission (super_admin only)
   */
  async restoreOrgUnit(orgUnitId: number): Promise<ApiResponse<OrgUnit>> {
    return this.post<ApiResponse<OrgUnit>>(`/${orgUnitId}/restore`, {});
  }

  /**
   * List archived/deleted org units
   * Returns paginated list of archived org units
   * Requires org_unit.view_deleted permission (super_admin only)
   */
  async listDeletedOrgUnits(
    params?: PaginationParams & { search?: string }
  ): Promise<PaginatedApiResponse<OrgUnit>> {
    return this.get<PaginatedApiResponse<OrgUnit>>('/deleted', { params });
  }
}

export const orgUnitsService = new OrgUnitsService();
export default orgUnitsService;
