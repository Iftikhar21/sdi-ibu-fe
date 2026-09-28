import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../../components/layout/panel/MainLayout';
import { useToast } from '../../../context/toast';
import { getApiErrorMessage } from '../../../utils/apiError';
import SubjectForm, { type SubjectFormValues } from './SubjectForm';
import { subjectService } from '../../../services/academicServices';

export default function SubjectCreate() {
    const navigate = useNavigate();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: SubjectFormValues) => {
        setIsSubmitting(true);
        try {
            await subjectService.create(data);
            toast.success('Mata pelajaran berhasil ditambahkan');
            navigate('/admin/mata-pelajaran');
        } catch (error) {
            console.error('Error creating subject:', error);
            toast.error('Gagal menambahkan mata pelajaran', getApiErrorMessage(error, 'silakan coba lagi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Tambah Mata Pelajaran | SDI Ikhlas Bakti Umat</title>
            </Helmet>
            <Layout title="Tambah Mata Pelajaran">
                <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-surface p-6 shadow-sm md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-2 text-xl font-bold text-body sm:text-2xl">
                            Tambah Mata Pelajaran
                        </h1>
                        <p className="text-sm text-muted sm:text-base">
                            Kode, nama, dan tingkat yang berlaku
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
                    <SubjectForm onSubmit={handleSubmit} loading={isSubmitting} />
                </div>
            </Layout>
        </>
    );
}
