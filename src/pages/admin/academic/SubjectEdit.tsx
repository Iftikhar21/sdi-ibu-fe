import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import SubjectForm, { type SubjectFormValues } from './SubjectForm';
import { subjectService } from '../../../services/academicServices';
import type { Subject } from '../../../types/academic';

export default function SubjectEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchSubject = async () => {
            if (!id) return;

            try {
                setSubject(await subjectService.getById(Number(id)));
            } catch (error) {
                console.error('Error fetching subject:', error);
                toast.error('Gagal memuat mata pelajaran', getApiErrorMessage(error, 'silakan coba lagi'));
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSubmit = async (data: SubjectFormValues) => {
        if (!id) return;

        setIsSubmitting(true);
        try {
            await subjectService.update(Number(id), data);
            toast.success('Mata pelajaran berhasil diperbarui');
            navigate('/admin/mata-pelajaran');
        } catch (error) {
            console.error('Error updating subject:', error);
            toast.error('Gagal memperbarui mata pelajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Edit Mata Pelajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Edit Mata Pelajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Edit Mata Pelajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Ubah kode, nama, tingkat, atau status
                        </p>
                    </div>
                    <Link
                        to="/admin/mata-pelajaran"
                        className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </div>

                <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
                            <p className="text-muted">Memuat data...</p>
                        </div>
                    ) : subject ? (
                        <SubjectForm
                            initialData={{
                                code: subject.code,
                                name: subject.name,
                                grade_level: subject.grade_level,
                                is_active: subject.is_active,
                            }}
                            onSubmit={handleSubmit}
                            loading={isSubmitting}
                        />
                    ) : (
                        <p className="py-12 text-center text-muted">Data tidak ditemukan.</p>
                    )}
                </div>
            </Layout>
        </>
    );
}
