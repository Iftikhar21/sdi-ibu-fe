import { Helmet } from 'react-helmet-async';
import ErrorPage from '../components/common/ErrorPage';

export default function ServerError() {
    return (
        <>
            <Helmet>
                <title>Terjadi Kesalahan | SDI Ikhlas Bakti Umat</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <ErrorPage code={500} />
        </>
    );
}
