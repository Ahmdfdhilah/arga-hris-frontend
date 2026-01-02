export interface CreateHolidayRequest {
    date: string;
    name: string;
    description?: string | null;
}

export interface UpdateHolidayRequest {
    date?: string;
    name?: string;
    description?: string | null;
    is_active?: boolean;
}

export interface HolidayFilterParams {
    year?: number;
    is_active?: boolean;
}
