export interface Holiday {
    id: number;
    date: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface HolidayListItem {
    id: number;
    date: string;
    name: string;
    is_active: boolean;
}

export interface IsHolidayResponse {
    date: string;
    is_holiday: boolean;
    holiday_name?: string | null;
}
