import MainLayout from "../../../components/layout/landing/MainLayout";
import { useEffect, useState } from "react";
import api from "../../../api/api";
import bg_1 from "@/assets/img/bg_1.svg";
import image_visi_misi_1 from "@/assets/img/image_visi_misi_1.svg";
import image_visi_misi_2 from "@/assets/img/image_visi_misi_2.svg";
import image_visi_misi_3 from "@/assets/img/image_visi_misi_3.svg";
import { Helmet } from "react-helmet-async";

interface VisiMisiData {
    id: number;
    vision: string | null;
    missions: string[] | null;
    created_at: string;
    updated_at: string;
}

const VisiMisiPage = () => {
    const [visiMisi, setVisiMisi] = useState<VisiMisiData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisiMisiData();
    }, []);

    const fetchVisiMisiData = async () => {
        try {
            const response = await api.get("/visi-misi");
            if (response.data.success) {
                setVisiMisi(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching visi misi:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-center text-white">
                    <p>Memuat data...</p>
                </div>
            </MainLayout>
        );
    }

    const hasVisi = visiMisi?.vision && visiMisi.vision.trim() !== "";
    const hasMisi =
        Array.isArray(visiMisi?.missions) && visiMisi!.missions.length > 0;

    return (
        <MainLayout>
            <Helmet>
                {/* TITLE */}
                <title>Visi & Misi SDI Ikhlas Bakti Umat | SDI Ibu</title>

                {/* META DESCRIPTION */}
                <meta
                    name="description"
                    content="Visi dan misi SDI Ikhlas Bakti Umat sebagai arah dan tujuan pendidikan Islam dalam membentuk generasi beriman, berilmu, dan berakhlak mulia."
                />

                {/* KEYWORDS (opsional tapi oke) */}
                <meta
                    name="keywords"
                    content="Visi Misi SDI, SDI Ikhlas Bakti Umat, Visi Misi Sekolah Islam, Sekolah Dasar Islam"
                />

                {/* OPEN GRAPH */}
                <meta
                    property="og:title"
                    content="Visi & Misi SDI Ikhlas Bakti Umat | SDI Ibu"
                />
                <meta
                    property="og:description"
                    content="Arah dan tujuan pendidikan SDI Ikhlas Bakti Umat dalam membentuk generasi Islami yang unggul."
                />
                <meta
                    property="og:type"
                    content="website"
                />
                <meta
                    property="og:url"
                    content={window.location.href}
                />

                {/* OG IMAGE (opsional) */}
                <meta
                    property="og:image"
                    content="https://www.sdiibu.com/og/visi-misi.jpg"
                />
            </Helmet>

            {/* HERO */}
            <div className="relative h-[400px] lg:h-[800px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bg_1}')` }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Visi Misi Sekolah Dasar
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Islam <span className="text-yellow-400">Ikhlas Bakti Umat</span>
                    </h2>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl">
                        Arah dan tujuan pendidikan SDI Ikhlas Bakti Umat
                    </p>
                </div>
            </div>

            {/* CONTENT */}
            <div className="container mx-auto px-4 py-16">
                {/* VISI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <div className="inline-block bg-blue-100 text-blue-600 px-12 py-3 rounded-full font-semibold mb-8">
                            Visi Kami
                        </div>

                        {hasVisi ? (
                            <div className="relative">
                                <div className="text-6xl text-gray-800 font-serif absolute -top-4 -left-2">
                                    "
                                </div>
                                <div className="pl-8">
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                                        {visiMisi!.vision}
                                    </h2>
                                </div>
                                <div className="text-6xl text-gray-800 font-serif text-right mt-2">
                                    "
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                Visi belum ditambahkan
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={image_visi_misi_1}
                                alt="Visi SDI"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* MISI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src={image_visi_misi_3}
                                alt="Misi SDI"
                                className="w-full h-[450px] object-cover"
                            />
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="inline-block bg-blue-100 text-blue-600 px-12 py-3 rounded-full font-semibold mb-8">
                            Misi Kami
                        </div>

                        {hasMisi ? (
                            <div className="space-y-5">
                                {visiMisi!.missions!.map((text, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <img
                                            src={image_visi_misi_2}
                                            alt="icon"
                                            className="w-12 h-12 mt-1"
                                        />
                                        <p className="text-gray-700 leading-relaxed pt-3">
                                            {text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                Misi belum ditambahkan
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default VisiMisiPage;