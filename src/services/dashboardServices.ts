import api from "../api/api";

export interface DashboardStats {
    registration_stats: {
        total: number;
        today: number;
        this_month: number;
        submitted: number;
        review: number;
        approved: number;
        rejected: number;
    };
    user_stats: {
        total: number;
        admin: number;
        user: number;
        new_today: number;
        new_this_month: number;
    };
    content_stats: {
        news_total: number;
        news_published: number;
        news_draft: number;
        program_total: number;
        program_active: number;
    };
    monthly_registrations: Record<string, number>;
    monthly_users: Record<string, number>;
    status_distribution: Record<string, number>;
    gender_distribution: Record<string, number>;
    latest_registrations: Array<{
        id: number;
        full_name: string;
        nickname: string;
        status: string;
        created_at: string;
        user_name: string;
    }>;
    latest_users: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
    }>;
}

export interface QuickStats {
    total_registrations: number;
    pending_review: number;
    total_users: number;
    new_users_today: number;
    total_news: number;
    total_programs: number;
}

export interface SchoolSummary {
    academic_years: Array<{ id: number; name: string; is_active: boolean }>;
    academic_year: { id: number; name: string; is_active: boolean } | null;
    registrations: {
        total: number;
        submitted: number;
        review: number;
        approved: number;
        rejected: number;
        without_academic_year: number;
    };
    students: {
        total: number;
        active: number;
        inactive: number;
        graduated: number;
    };
    classes: {
        total: number;
        capacity: number;
        filled: number;
        available: number;
        rows: Array<{
            id: number;
            display_name: string;
            grade_level: number;
            quota: number;
            filled: number;
            available: number;
            is_active: boolean;
        }>;
    };
    unplaced_students: number;
    graduates: {
        total: number;
        this_year: number;
        by_year: Array<{ id: number; name: string; total: number }>;
    };
}

export const dashboardService = {
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get("/admin/dashboard", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    async getQuickStats(): Promise<QuickStats> {
        const response = await api.get("/admin/dashboard/quick-stats", {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.data;
    },

    // Rekap data sekolah (mengikuti tahun ajaran yang dipilih)
    async getSchoolSummary(academicYearId?: number): Promise<SchoolSummary> {
        const response = await api.get("/admin/dashboard/school-summary", {
            params: academicYearId ? { academic_year_id: academicYearId } : {}
        });

        return response.data.data;
    }
};
