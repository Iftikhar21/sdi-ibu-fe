import { Helmet } from "react-helmet-async";
import ErrorPage from "../components/common/ErrorPage";

export default function Forbidden() {
    return (
        <>
            <Helmet>
                <title>Akses Dibatasi | SDI Ikhlas Bakti Umat</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <ErrorPage code={403} />
        </>
    );
}
