import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../context/toast';

/**
 * Ganti password sendiri.
 *
 * Dipakai dua keadaan:
 * - wajib (akun guru baru dari admin) — tidak bisa dilewati sebelum diganti
 * - sukarela (ganti password kapan saja)
 */
export default function ChangePassword() {
    const { user, changePassword, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wajibGanti = Boolean(user?.must_change_password);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password baru minimal 8 karakter.');
            return;
        }

        if (password !== confirmation) {
            setError('Konfirmasi password baru tidak sama.');
            return;
        }

        setIsSubmitting(true);
        try {
            await changePassword(currentPassword, password, confirmation);

            toast.success('Password berhasil diperbarui');

            const role = user?.role?.role_name;

            navigate(
                role === 'guru' ? '/guru/dashboard' : role === 'admin' ? '/admin/dashboard' : '/user/dashboard',
                { replace: true }
            );
        } catch (err) {
            console.error('Error changing password:', err);
            setError(getApiErrorMessage(err, 'Gagal mengganti password.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Ganti Password | SDI Ikhlas Bakti Umat</title>
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand/20">
                            <KeyRound className="h-7 w-7 text-brand" />
                        </div>
                        <h1 className="text-xl font-bold text-body">Ganti Password</h1>
                        <p className="mt-2 text-sm text-muted">
                            {wajibGanti
                                ? 'Demi keamanan, ganti password awal Anda sebelum melanjutkan.'
                                : 'Masukkan password saat ini lalu password baru Anda.'}
                        </p>
                    </div>

                    {wajibGanti && (
                        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>
                                Password awal diberikan oleh admin. Setelah diganti, gunakan
                                password baru untuk login berikutnya.
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Password Saat Ini
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Password Baru
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-body">
                                Konfirmasi Password Baru
                            </label>
                            <input
                                type="password"
                                value={confirmation}
                                onChange={(event) => setConfirmation(event.target.value)}
                                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-body shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <KeyRound className="mr-2 h-4 w-4" />
                            )}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            navigate('/login', { replace: true });
                        }}
                        className="mt-4 w-full text-center text-sm text-muted hover:text-body"
                    >
                        Keluar dari akun
                    </button>
                </div>
            </div>
        </>
    );
}
