import type { ReactNode } from 'react';
import TablePagination from './TablePagination';
import { useTablePagination } from './useTablePagination';

interface Props<T> {
    rows: readonly T[];
    children: (visibleRows: T[]) => ReactNode;
}

export default function PaginatedTableSection<T>({ rows, children }: Props<T>) {
    const { pageItems, pagination } = useTablePagination(rows);

    return (
        <>
            {children(pageItems)}
            <TablePagination {...pagination} />
        </>
    );
}
