import { Helmet } from 'react-helmet-async';
import ErrorPage from '../components/common/ErrorPage';

export default function NotFound() {
    return (
        <>
            <Helmet>
                <title>Halaman Tidak Ditemukan | SDI Ikhlas Bakti Umat</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <ErrorPage code={404} />
        </>
    );
}
