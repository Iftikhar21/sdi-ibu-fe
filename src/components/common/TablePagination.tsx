interface PaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export default function TablePagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: PaginationProps) {
    if (totalItems === 0) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <nav aria-label="Halaman tabel" className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
            <span>Menampilkan {start}–{end} dari {totalItems} data</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-line px-3 py-1.5 text-body hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                <span aria-live="polite">{page} / {totalPages}</span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-line px-3 py-1.5 text-body hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Berikutnya
                </button>
            </div>
        </nav>
    );
}
