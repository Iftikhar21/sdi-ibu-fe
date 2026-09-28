import MainLayout from "../../../components/layout/landing/MainLayout";
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/api';
import bg_1 from "@/assets/img/bg_1.svg";
import bg_2 from "@/assets/img/bg_2.svg";
import { Helmet } from "react-helmet-async";

interface ProgramData {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    thumbnail_url?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

const ProgramPage = () => {
    const [programs, setPrograms] = useState<ProgramData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const response = await api.get('/program-list');
            if (response.data.success) {
                setPrograms(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format deskripsi (potong jika terlalu panjang)
    const truncateDescription = (text: string, maxLength: number = 120) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="relative h-[400px] lg:h-[800px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${bg_1}')` }}
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                        <p>Memuat program...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Helmet>
                {/* TITLE */}
                <title>Program Unggulan | SDI Ibu</title>

                {/* META DESCRIPTION */}
                <meta
                    name="description"
                    content="Program unggulan SDI Ibu untuk membentuk generasi berprestasi dan berakhlak dengan kurikulum Islami."
                />

                {/* OPEN GRAPH (WA / FB) */}
                <meta property="og:title" content="Program Unggulan | SDI Ibu" />
                <meta
                    property="og:description"
                    content="Program unggulan SDI Ibu dengan pendidikan Islami berkualitas dan terstruktur."
                />
                <meta property="og:type" content="website" />
            </Helmet>
            {/* HERO */}
            <div className="relative h-[400px] lg:h-[800px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bg_1}')` }}
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        Program Unggulan Sekolah
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                        Dasar Islam <span className="text-yellow-400">Ikhlas Bakti Umat</span>
                    </h2>
                    <p className="mt-6 text-lg text-muted max-w-3xl">
                        Program pilihan untuk membentuk generasi berprestasi dan berakhlak.
                    </p>
                </div>
            </div>

            {/* Programs Section */}
            <div className="relative py-20 overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${bg_2}')` }}
                />

                {/* White Gradient Top */}
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-surface via-surface/90 to-transparent" />

                {/* White Gradient Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-surface via-surface/90 to-transparent" />

                {/* Soft overlay biar bg ga terlalu rame */}
                <div className="absolute inset-0" />

                {/* Content */}
                <div className="relative container mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block bg-brand/20 text-brand px-5 py-2 rounded-full text-sm font-medium mb-4">
                            Program Kami
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Program <span className="text-accent">Unggulan</span>
                        </h2>
                        <p className="text-muted max-w-2xl mx-auto">
                            Program pendidikan Al-Quran untuk berbagai usia dengan kurikulum terstruktur
                        </p>
                    </div>

                    {/* Program Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {programs.length > 0 ? (
                            programs.map((program) => (
                                <div
                                    key={program.id}
                                    className="bg-surface rounded-4xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-b-12 border-brand"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={program.thumbnail_url || "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=400&h=400&fit=crop"}
                                            alt={program.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-body mb-3">
                                            {program.title}
                                        </h3>
                                        <p className="text-muted text-sm leading-relaxed mb-6">
                                            {truncateDescription(program.description)}
                                        </p>

                                        <Link
                                            to={`/profil/program/${program.slug}`}
                                            className="w-12 h-12 bg-brand hover:bg-blue-700 cursor-pointer text-white rounded-full flex items-center justify-center transition-colors duration-300 ml-auto"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted">Belum ada program yang tersedia</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProgramPage;
