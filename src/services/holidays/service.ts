import { BaseService } from '../base/service';
import type {
    ApiResponse,
    PaginatedApiResponse,
    PaginationParams,
} from '../base/types';
import type {
    Holiday,
    HolidayListItem,
    IsHolidayResponse,
    CreateHolidayRequest,
    UpdateHolidayRequest,
    HolidayFilterParams,
} from './types';

class HolidaysService extends BaseService {
    constructor() {
        super('/holidays');
    }

    async checkIsHoliday(date: string): Promise<ApiResponse<IsHolidayResponse>> {
        return this.get<ApiResponse<IsHolidayResponse>>('/check', { target_date: date });
    }

    async getHolidays(
        params?: PaginationParams & HolidayFilterParams,
    ): Promise<PaginatedApiResponse<HolidayListItem>> {
        return this.get<PaginatedApiResponse<HolidayListItem>>('', params);
    }

    async getHoliday(id: number): Promise<ApiResponse<Holiday>> {
        return this.get<ApiResponse<Holiday>>(`/${id}`);
    }

    async createHoliday(request: CreateHolidayRequest): Promise<ApiResponse<Holiday>> {
        return this.post<ApiResponse<Holiday>>('', request);
    }

    async updateHoliday(
        id: number,
        request: UpdateHolidayRequest,
    ): Promise<ApiResponse<Holiday>> {
        return this.patch<ApiResponse<Holiday>>(`/${id}`, request);
    }

    async deleteHoliday(id: number): Promise<ApiResponse<null>> {
        return this.delete<ApiResponse<null>>(`/${id}`);
    }
}

export const holidaysService = new HolidaysService();
export default holidaysService;
