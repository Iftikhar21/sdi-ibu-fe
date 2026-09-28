export interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    classrooms_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AcademicYearPayload {
    name: string;
    start_date: string;
    end_date: string;
    is_active?: boolean;
}
