import { useState } from 'react';

export function useTablePagination<T>(rows: readonly T[], pageSize = 10) {
    const [requestedPage, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(requestedPage, totalPages);

    return {
        pageItems: rows.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
            page,
            totalPages,
            totalItems: rows.length,
            pageSize,
            onPageChange: setPage,
        },
    };
}
