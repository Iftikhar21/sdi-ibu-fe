import MainLayout from "../../../components/layout/landing/MainLayout";
import { Clock, Users, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../../api/api';
import bg_1 from '@/assets/img/bg_1.svg';
import image_sejarah_1 from '@/assets/img/image_sejarah_1.svg';
import image_sejarah_2 from '@/assets/img/image_sejarah_2.svg';

interface SejarahData {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

const SejarahPage = () => {
    const [sejarah, setSejarah] = useState<SejarahData | null>(null);
    const [programCount, setProgramCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSejarahData();
    }, []);

    const fetchSejarahData = async () => {
        try {
            const response = await api.get('/sejarah');
            if (response.data.success) {
                setSejarah(response.data.data.sejarah);
                setProgramCount(response.data.data.program_count);
            }
        } catch (error) {
            console.error('Error fetching sejarah:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format content dengan line breaks
    const formatContent = (content: string) => {
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
                {paragraph}
            </p>
        ));
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[800px] bg-gradient-to-r from-blue-900/90 to-blue-800/90">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${bg_1}')`,
                        backgroundBlendMode: 'overlay'
                    }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Sejarah Sekolah Dasar Islam
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        <span className="text-yellow-400">Ikhlas Bakti Umat</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl">
                        Perjalanan SDI Ikhlas Bakti Umat dalam membangun pendidikan Islam
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-16">
                    {/* Image */}
                    <div className="order-2 lg:order-1">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={image_sejarah_1}
                                alt="SDI Ikhlas Bakti Umat"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="order-1 lg:order-2 lg:col-span-2">
                        <div className="inline-block bg-[#004AAD33] text-[#004AAD] px-4 py-2 rounded-full text-sm font-medium mb-4">
                            Sejarah
                        </div>
                        <h2 className="text-3xl font-bold mb-6">
                            Sejarah SDI <span className="text-red-500">Ikhlas Bakti Umat</span>
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            {sejarah ? formatContent(sejarah.content) : (
                                <>
                                    <p>
                                        SD Islam (SDI) didirikan untuk menghadirkan pendidikan dasar yang
                                        mengintegrasikan ilmu pengetahuan, nilai keislaman, dan pembentukan
                                        karakter sejak usia dini.
                                    </p>
                                    <p>
                                        Sekolah ini berdiri dengan visi menjadi lembaga pendidikan Islam
                                        yang unggul dalam membentuk generasi Qur'ani yang berakhlak mulia
                                        dan siap menghadapi tantangan masa depan dengan fondasi iman yang
                                        kuat.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-[#004AAD] rounded-2xl py-12 px-6 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-white text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/20 rounded-full p-4 mb-4">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <div className="text-4xl font-bold mb-2">{programCount}+</div>
                            <div className="text-white">Program Unggulan</div>
                        </div>
                    </div>
                </div>

                {/* Second Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    {/* Text Content */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4 text-gray-700 leading-relaxed lg:col-span-2">
                            {sejarah ? formatContent(sejarah.content) : (
                                <>
                                    <p>
                                        SD Islam (SDI) didirikan untuk menghadirkan pendidikan dasar yang
                                        mengintegrasikan ilmu pengetahuan, nilai keislaman, dan pembentukan
                                        karakter sejak usia dini.
                                    </p>
                                    <p>
                                        Sekolah ini berdiri dengan visi menjadi lembaga pendidikan Islam
                                        yang unggul dalam membentuk generasi Qur'ani yang berakhlak mulia
                                        dan siap menghadapi tantangan masa depan dengan fondasi iman yang
                                        kuat.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Image */}
                    <div>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={image_sejarah_2}
                                alt="SDI Ikhlas Bakti Umat"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default SejarahPage;