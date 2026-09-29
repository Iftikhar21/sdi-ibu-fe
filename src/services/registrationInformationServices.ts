import api from '../api/api';

export interface RegistrationRequirementInput {
    id?: number;
    content: string;
    is_active: boolean;
}

export interface RegistrationFeeInput {
    id?: number;
    program: string;
    amount: number;
    description: string | null;
    is_active: boolean;
}

export interface ClassroomQuota {
    id: number;
    name: string;
    grade_level: number;
    quota: number;
    filled: number;
    available: number;
}

export interface RegistrationInformation {
    phase: 'closed' | 'account' | 'open';
    phase_message: string | null;
    academic_year: { id: number; name: string } | null;
    quota: number;
    registered: number;
    available: number | null;
    quota_description: string | null;
    payment_bank: string | null;
    payment_account_number: string | null;
    payment_account_name: string | null;
    class_quotas: ClassroomQuota[];
    requirements: RegistrationRequirementInput[];
    fees: RegistrationFeeInput[];
}

export interface RegistrationInformationPayload {
    phase: RegistrationInformation['phase'];
    phase_message: string | null;
    quota: number;
    quota_description: string | null;
    payment_bank: string | null;
    payment_account_number: string | null;
    payment_account_name: string | null;
    requirements: Array<Pick<RegistrationRequirementInput, 'content' | 'is_active'>>;
    fees: Array<Pick<RegistrationFeeInput, 'program' | 'amount' | 'description' | 'is_active'>>;
}

export const registrationInformationService = {
    async getPublic(): Promise<RegistrationInformation> {
        const response = await api.get('/registration-information');
        return response.data.data;
    },

    async getAdmin(): Promise<RegistrationInformation> {
        const response = await api.get('/admin/registration-information');
        return response.data.data;
    },

    async update(payload: RegistrationInformationPayload): Promise<RegistrationInformation> {
        const response = await api.put('/admin/registration-information', payload);
        return response.data.data;
    },
};
