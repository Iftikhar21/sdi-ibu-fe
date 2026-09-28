import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Gallery } from '../../types/gallery';

interface GalleryLightboxProps {
    album: Gallery | null;
    photoIndex: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

export default function GalleryLightbox({
    album,
    photoIndex,
    onClose,
    onIndexChange,
}: GalleryLightboxProps) {
    const totalPhotos = album?.photos.length ?? 0;

    // Navigasi keyboard + kunci scroll halaman selama lightbox terbuka
    useEffect(() => {
        if (!album || totalPhotos === 0) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowRight') {
                onIndexChange((photoIndex + 1) % totalPhotos);
            } else if (event.key === 'ArrowLeft') {
                onIndexChange((photoIndex - 1 + totalPhotos) % totalPhotos);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [album, photoIndex, totalPhotos, onClose, onIndexChange]);

    if (!album || totalPhotos === 0) return null;

    const currentPhoto = album.photos[photoIndex];

    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Tutup galeri"
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
                <X className="h-6 w-6" />
            </button>

            <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
                <img
                    src={currentPhoto?.image_url ?? ''}
                    alt={`${album.title} - foto ${photoIndex + 1}`}
                    className="mx-auto max-h-[75vh] w-full rounded-xl object-contain"
                />

                {totalPhotos > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => onIndexChange((photoIndex - 1 + totalPhotos) % totalPhotos)}
                            aria-label="Foto sebelumnya"
                            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:bg-surface hover:text-brand"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onIndexChange((photoIndex + 1) % totalPhotos)}
                            aria-label="Foto berikutnya"
                            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md transition hover:bg-surface hover:text-brand"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                <div className="mt-4 text-center text-white">
                    <p className="text-lg font-semibold">{album.title}</p>
                    <p className="mt-1 text-sm text-white/70">
                        {album.category?.name ?? 'Galeri'} • Foto {photoIndex + 1} dari {totalPhotos}
                    </p>
                    {album.description && (
                        <p className="mx-auto mt-2 max-w-2xl text-sm text-white/60">
                            {album.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
