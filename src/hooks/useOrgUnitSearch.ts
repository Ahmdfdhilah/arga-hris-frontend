import { orgUnitsService } from '@/services/org_units';
import type { OrgUnit } from '@/services/org_units/types';
import type { PaginatedApiResponse, ApiResponse } from '@/services/base/types';
import { createSearchHook } from '@/utils/createSearchHook';

export function useOrgUnitSearch() {
  const searchFunction = (
    term: string,
    limit = 50,
    page = 1,
  ): Promise<PaginatedApiResponse<OrgUnit>> =>
    orgUnitsService.listOrgUnits({ page, limit, search: term });

  const getByIdFunction = (id: number): Promise<ApiResponse<OrgUnit>> =>
    orgUnitsService.getOrgUnit(id);

  return createSearchHook<OrgUnit>({
    searchFunction,
    getByIdFunction,
    formatter: (unit) => ({
      value: unit.id,
      label: `${unit.code} - ${unit.name}`,
      description: unit.name || undefined,
    }),
  });
}
