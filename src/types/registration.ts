export interface RegistrationFormData {
    full_name: string;
    nickname: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    previous_school: string;
    father_name: string;
    mother_name: string;
    address: string;
    phone: string;
    contact_email: string;
    photo: File;
    birth_certificate: File;
    family_card: File;
    payment_proof: File;
    transfer_proof?: File | null;
}

export interface Registration {
    id: number;
    /** Nomor pendaftaran unik, mis. REG-2026-0001. */
    registration_number?: string | null;
    user_id: number;
    academic_year_id?: number | null;
    academic_year?: { id: number; name: string } | null;
    /** Kelas yang sedang ditempati (null bila belum ditempatkan). */
    classroom_id?: number | null;
    classroom_label?: string | null;
    /** Data siswa yang terbentuk dari pendaftaran ini (bila sudah Diterima). */
    student?: {
        id: number;
        nis: string | null;
        status: string;
        status_label?: string;
    } | null;
    full_name: string;
    nickname: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    previous_school?: string | null;
    father_name: string;
    mother_name: string;
    address: string;
    phone: string;
    contact_email: string;
    photo: string;
    birth_certificate: string;
    family_card: string;
    payment_proof: string;
    transfer_proof?: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    photo_url: string;
    birth_certificate_url: string;
    family_card_url: string;
    payment_proof_url: string;
    transfer_proof_url?: string | null;
}

export interface RegistrationWithUser extends Registration {
    user?: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    };
}
