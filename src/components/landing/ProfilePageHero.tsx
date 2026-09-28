import type { ElementType } from 'react';

interface ProfilePageHeroProps {
    badge: string;
    title: string;
    description: string;
    icon: ElementType;
}

/**
 * Kepala halaman untuk halaman-halaman di section Profil.
 */
export default function ProfilePageHero({
    badge,
    title,
    description,
    icon: Icon,
}: ProfilePageHeroProps) {
    return (
        <div className="bg-brand px-4 pb-16 pt-32 text-center text-white">
            <div className="container mx-auto">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {badge}
                </div>
                <h1 className="mb-4 text-3xl font-bold md:text-4xl">{title}</h1>
                <p className="mx-auto max-w-2xl text-white/80">{description}</p>
            </div>
        </div>
    );
}
