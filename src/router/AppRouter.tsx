import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../pages/auth/Login";
import Forbidden from "../pages/Forbidden";
import Register from "../pages/auth/Register";

// Landing Pages
import HomePage from "../pages/landing/Beranda";
import SejarahPage from "../pages/landing/profile/Sejarah";
import VisiMisiPage from "../pages/landing/profile/VisiMisi";
import ProgramPage from "../pages/landing/profile/Program";
import ProgramDetailPage from "../pages/landing/profile/ProgramDetail";
import BeritaPage from "../pages/landing/Berita";
import BeritaDetailPage from "../pages/landing/BeritaDetail";
import KontakPage from "../pages/landing/Kontak";
// import PendaftaranPage from "../pages/frontend/PendaftaranPage";

// Admin Dashboard
import Dashboard from "../pages/admin/Dashboard";

// Admin - Sejarah
import SejarahList from "../pages/admin/sejarah/SejarahList";
import SejarahCreate from "../pages/admin/sejarah/SejarahCreate";
import SejarahEdit from "../pages/admin/sejarah/SejarahEdit";

// Admin - Visi Misi
import VisiMisiList from "../pages/admin/visi misi/VisiMisiList";
import VisiMisiCreate from "../pages/admin/visi misi/VisiMisiCreate";
import VisiMisiEdit from "../pages/admin/visi misi/VisiMisiEdit";

// Admin - Program
import ProgramList from "../pages/admin/program/ProgramList";
import ProgramEdit from "../pages/admin/program/ProgramEdit";
import ProgramCreate from "../pages/admin/program/ProgramCreate";
import ProgramDetail from "../pages/admin/program/ProgramListDetail";

// Admin - Berita
import NewsList from "../pages/admin/news/NewsList";
import NewsDetail from "../pages/admin/news/NewsListDetail";
import NewsCreate from "../pages/admin/news/NewsCreate";
import NewsEdit from "../pages/admin/news/NewsEdit";

// Admin - Kontak
import ContactList from "../pages/admin/contact/ContactList";
import ContactCreate from "../pages/admin/contact/ContactCreate";
import ContactEdit from "../pages/admin/contact/ContactEdit";

// Admin - Kelola Pengguna
import UserList from "../pages/admin/manage user/ManageUserList";
import UserCreate from "../pages/admin/manage user/ManageUserCreate";
import UserEdit from "../pages/admin/manage user/ManageUserEdit";
import ManageAdminList from "../pages/admin/manage user/admin/ManageAdminList";
import ManageUserList from "../pages/admin/manage user/user/ManageUserList";
import DashboardUser from "../pages/user/Dashboard";
import AdminProfile from "../pages/admin/profile/AdminProfile";
import PendaftaranPage from "../pages/landing/registrations/Registration";
import RegistrationDetail from "../pages/user/RegistrationDetail";
import AdminRegistrationList from "../pages/admin/registrations/AdminRegistrationList";
import AdminRegistrationDetail from "../pages/admin/registrations/AdminRegistrationDetail";
import UserProfile from "../pages/user/profile/UserProfile";

// User Pages (contoh, sesuaikan dengan kebutuhan)
// import UserDashboard from "../pages/user/Dashboard";
// import UserProfile from "../pages/user/Profile";

// import NotFound from "../pages/NotFound";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ========================= */}
                {/* LANDING / PUBLIC ROUTES */}
                {/* ========================= */}
                <Route path="/" element={<HomePage />} />
                <Route path="/profil">
                    <Route path="sejarah" element={<SejarahPage />} />
                    <Route path="visi-misi" element={<VisiMisiPage />} />
                    <Route path="program" element={<ProgramPage />} />
                    <Route path="program/:slug" element={<ProgramDetailPage />} />
                </Route>
                <Route path="/berita">
                    <Route index element={<BeritaPage />} />
                    <Route path=":slug" element={<BeritaDetailPage />} />
                </Route>
                <Route path="/kontak" element={<KontakPage />} />
                <Route path="/pendaftaran" element={<PendaftaranPage />} />

                {/* =============== */}
                {/* AUTH ROUTES */}
                {/* =============== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forbidden" element={<Forbidden />} />

                {/* =============== */}
                {/* ADMIN ROUTES */}
                {/* =============== */}
                <Route path="/admin">
                    {/* Dashboard */}
                    <Route path="dashboard" element={
                        <ProtectedRoute role="admin">
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    {/* Sejarah */}
                    <Route path="sejarah">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <SejarahList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <SejarahCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <SejarahEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Visi Misi */}
                    <Route path="visi-misi">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <VisiMisiList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <VisiMisiCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <VisiMisiEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Program */}
                    <Route path="program">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <ProgramList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <ProgramCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute role="admin">
                                <ProgramDetail />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <ProgramEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Berita */}
                    <Route path="news">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <NewsList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <NewsCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute role="admin">
                                <NewsDetail />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <NewsEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Kontak */}
                    <Route path="contacts">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <ContactList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <ContactCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <ContactEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Kelola Pengguna */}
                    <Route path="kelola-pengguna">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <UserList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <UserCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <UserEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Kelola Admin */}
                    <Route path="kelola-admin" element={
                        <ProtectedRoute role="admin">
                            <ManageAdminList />
                        </ProtectedRoute>
                    } />

                    <Route path="kelola-user" element={
                        <ProtectedRoute role="admin">
                            <ManageUserList />
                        </ProtectedRoute>
                    } />

                    <Route path="registrations">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <AdminRegistrationList />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute role="admin">
                                <AdminRegistrationDetail />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Profil Admin */}
                    <Route
                        path="/admin/profil"
                        element={
                            <ProtectedRoute role="admin">
                                <AdminProfile />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* =============== */}
                {/* USER ROUTES */}
                {/* =============== */}
                
                <Route path="/user">
                    <Route path="dashboard" element={
                        <ProtectedRoute role="user">
                            <DashboardUser />
                        </ProtectedRoute>
                    } />
                    <Route path="registrations">
                        <Route index element={
                            <ProtectedRoute role="user">
                                <DashboardUser />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute role="user">
                                <RegistrationDetail />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Profil User */}
                    <Route
                        path="profil"
                        element={
                            <ProtectedRoute role="user">
                                <UserProfile />
                            </ProtectedRoute>
                        }
                    />
                </Route>
               

                {/* ======================== */}
                {/* 404 NOT FOUND (opsional) */}
                {/* ======================== */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </BrowserRouter>
    );
}