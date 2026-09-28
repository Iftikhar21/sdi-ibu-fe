export type ActivityType = 'prestasi' | 'agenda';

export interface Activity {
    id: number;
    type: ActivityType;
    type_label?: string;
    title: string;
    description: string;
    image?: string | null;
    image_url?: string | null;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ActivityPayload {
    type: ActivityType;
    title: string;
    description: string;
    image?: File | null;
    sort_order?: number;
    is_active?: boolean;
}

/** Jenis kegiatan yang tersedia beserta labelnya. */
export const activityTypes: { value: ActivityType; label: string; description: string }[] = [
    {
        value: 'prestasi',
        label: 'Prestasi',
        description: 'Capaian dan penghargaan yang diraih murid maupun sekolah',
    },
    {
        value: 'agenda',
        label: 'Agenda Sekolah',
        description: 'Rencana dan jadwal kegiatan sekolah yang akan datang',
    },
];

export const getActivityTypeLabel = (type: string): string =>
    activityTypes.find((item) => item.value === type)?.label ?? type;
