import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import defaultLogo from '@/assets/img/logo-sdi-ibu.svg';
import api from '../../api/api';

let cachedLogoUrl: string | null = null;
let logoRequest: Promise<string> | null = null;

const loadWebsiteLogo = () => {
    if (cachedLogoUrl) return Promise.resolve(cachedLogoUrl);

    if (!logoRequest) {
        logoRequest = api.get('/kontak')
            .then((response) => response.data?.data?.logo_url || defaultLogo)
            .catch(() => defaultLogo)
            .then((url) => {
                cachedLogoUrl = url;
                return url;
            });
    }

    return logoRequest;
};

interface WebsiteLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
    sourceUrl?: string | null;
}

export default function WebsiteLogo({ sourceUrl, alt = 'Logo SDI Ikhlas Bakti Umat', ...props }: WebsiteLogoProps) {
    const [remoteLogoUrl, setRemoteLogoUrl] = useState(cachedLogoUrl || defaultLogo);

    useEffect(() => {
        if (sourceUrl !== undefined) return;

        let active = true;
        loadWebsiteLogo().then((url) => {
            if (active) setRemoteLogoUrl(url);
        });

        return () => {
            active = false;
        };
    }, [sourceUrl]);

    const logoUrl = sourceUrl !== undefined
        ? sourceUrl || defaultLogo
        : remoteLogoUrl;

    return (
        <img
            {...props}
            src={logoUrl}
            alt={alt}
            onError={(event) => {
                if (event.currentTarget.src !== defaultLogo) {
                    event.currentTarget.src = defaultLogo;
                }
            }}
        />
    );
}
