export interface RegistrationFormData {
    full_name: string;
    nickname: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    father_name: string;
    mother_name: string;
    address: string;
    phone: string;
    contact_email: string;
    photo: File;
    birth_certificate: File;
    family_card: File;
    payment_proof: File;
}

export interface Registration {
    id: number;
    user_id: number;
    full_name: string;
    nickname: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    father_name: string;
    mother_name: string;
    address: string;
    phone: string;
    contact_email: string;
    photo: string;
    birth_certificate: string;
    family_card: string;
    payment_proof: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    photo_url: string;
    birth_certificate_url: string;
    family_card_url: string;
    payment_proof_url: string;
}

export interface RegistrationWithUser extends Registration {
    user?: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    };
}