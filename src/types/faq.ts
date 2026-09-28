export interface Faq {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateFaqDto {
    question: string;
    answer: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface UpdateFaqDto {
    question?: string;
    answer?: string;
    sort_order?: number;
    is_active?: boolean;
}
