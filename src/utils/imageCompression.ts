const defaultMaxBytes = 1.5 * 1024 * 1024;
const defaultMaxDimension = 2200;

const loadImage = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
    if ('createImageBitmap' in window) {
        return window.createImageBitmap(file);
    }

    const objectUrl = URL.createObjectURL(file);

    try {
        return await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('File gambar tidak dapat dibaca.'));
            image.src = objectUrl;
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Gambar gagal dikompres.')),
            'image/jpeg',
            quality,
        );
    });

/**
 * Mengecilkan foto dari kamera sebelum dikirim agar request multipart tetap ringan.
 * Gambar kecil dibiarkan apa adanya supaya tidak kehilangan kualitas tanpa alasan.
 */
export async function optimizeImageForUpload(
    file: File,
    maxBytes = defaultMaxBytes,
    maxDimension = defaultMaxDimension,
): Promise<File> {
    if (file.size <= maxBytes) return file;

    const image = await loadImage(file);

    try {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Browser tidak mendukung kompresi gambar.');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let quality = 0.86;
        let blob = await canvasToBlob(canvas, quality);

        while (blob.size > maxBytes && quality > 0.54) {
            quality -= 0.08;
            blob = await canvasToBlob(canvas, quality);
        }

        if (blob.size >= file.size) return file;

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'gambar';
        return new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } finally {
        if ('close' in image && typeof image.close === 'function') image.close();
    }
}
