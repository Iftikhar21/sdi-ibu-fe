import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Login from "../pages/auth/Login";
import ChangePassword from "../pages/auth/ChangePassword";
import Forbidden from "../pages/Forbidden";
import NotFound from "../pages/NotFound";
import Register from "../pages/auth/Register";

// Landing Pages
import HomePage from "../pages/landing/Beranda";
import SejarahPage from "../pages/landing/profile/Sejarah";
import VisiMisiPage from "../pages/landing/profile/VisiMisi";
import ProgramPage from "../pages/landing/profile/Program";
import ProgramDetailPage from "../pages/landing/profile/ProgramDetail";
import AboutSchoolPage from "../pages/landing/profile/AboutSchool";
import NilaiPendidikanPage from "../pages/landing/profile/NilaiPendidikan";
import KepalaSekolahPage from "../pages/landing/profile/KepalaSekolah";
import GuruPage from "../pages/landing/profile/Guru";
import LegalitasPage from "../pages/landing/profile/Legalitas";
import LulusanPage from "../pages/landing/profile/Lulusan";
import StrukturOrganisasiPage from "../pages/landing/profile/StrukturOrganisasi";
import BeritaPage from "../pages/landing/Berita";
import BeritaDetailPage from "../pages/landing/BeritaDetail";
import KontakPage from "../pages/landing/Kontak";
import GaleriPage from "../pages/landing/Galeri";
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

// Admin - FAQ
import FaqList from "../pages/admin/faq/FaqList";
import FaqCreate from "../pages/admin/faq/FaqCreate";
import FaqEdit from "../pages/admin/faq/FaqEdit";

// Admin - Galeri
import GalleryList from "../pages/admin/gallery/GalleryList";
import GalleryCreate from "../pages/admin/gallery/GalleryCreate";
import GalleryEdit from "../pages/admin/gallery/GalleryEdit";
import GalleryCategoryList from "../pages/admin/gallery/GalleryCategoryList";

// Admin - Profil Sekolah
import AboutSchoolList from "../pages/admin/profile/AboutSchoolList";
import ActivityList from "../pages/admin/kegiatan/ActivityList";
import ActivityCreate from "../pages/admin/kegiatan/ActivityCreate";
import ActivityEdit from "../pages/admin/kegiatan/ActivityEdit";
import AcademicYearList from "../pages/admin/master/AcademicYearList";
import AcademicYearCreate from "../pages/admin/master/AcademicYearCreate";
import AcademicYearEdit from "../pages/admin/master/AcademicYearEdit";
import ClassroomList from "../pages/admin/master/ClassroomList";
import ClassroomCreate from "../pages/admin/master/ClassroomCreate";
import ClassroomEdit from "../pages/admin/master/ClassroomEdit";
import StudentList from "../pages/admin/students/StudentList";
import StudentDetail from "../pages/admin/students/StudentDetail";
import ClassroomPlacementList from "../pages/admin/placements/ClassroomPlacementList";
import EducationValueList from "../pages/admin/profile/EducationValueList";
import EducationValueCreate from "../pages/admin/profile/EducationValueCreate";
import EducationValueEdit from "../pages/admin/profile/EducationValueEdit";
import PrincipalList from "../pages/admin/profile/PrincipalList";
import PrincipalCreate from "../pages/admin/profile/PrincipalCreate";
import PrincipalEdit from "../pages/admin/profile/PrincipalEdit";
import TeacherList from "../pages/admin/profile/TeacherList";
import TeacherCreate from "../pages/admin/profile/TeacherCreate";
import TeacherEdit from "../pages/admin/profile/TeacherEdit";
import OrganizationList from "../pages/admin/profile/OrganizationList";
import OrganizationCreate from "../pages/admin/profile/OrganizationCreate";
import OrganizationEdit from "../pages/admin/profile/OrganizationEdit";
import SubjectList from "../pages/admin/academic/SubjectList";
import SubjectCreate from "../pages/admin/academic/SubjectCreate";
import SubjectEdit from "../pages/admin/academic/SubjectEdit";
import GradeInput from "../pages/admin/academic/GradeInput";
import AttendanceInput from "../pages/admin/academic/AttendanceInput";
import ScheduleList from "../pages/admin/academic/ScheduleList";
import ReportCard from "../pages/admin/academic/ReportCard";
import AcademicDashboard from "../pages/admin/academic/AcademicDashboard";
import TeacherAssignment from "../pages/admin/academic/TeacherAssignment";
import LegalityList from "../pages/admin/profile/LegalityList";
import GraduationList from "../pages/admin/students/GraduationList";
import GraduateList from "../pages/admin/students/GraduateList";
import PromotionList from "../pages/admin/students/PromotionList";

// Admin - Kelola Pengguna
import UserList from "../pages/admin/manage user/ManageUserList";
import UserCreate from "../pages/admin/manage user/ManageUserCreate";
import UserEdit from "../pages/admin/manage user/ManageUserEdit";
import ManageAdminList from "../pages/admin/manage user/admin/ManageAdminList";
import ManageUserList from "../pages/admin/manage user/user/ManageUserList";
import DashboardUser from "../pages/user/Dashboard";
import GuruDashboard from "../pages/guru/Dashboard";
import AdminProfile from "../pages/admin/profile/AdminProfile";
import PendaftaranPage from "../pages/landing/registrations/Registration";
import RegistrationDetail from "../pages/user/RegistrationDetail";
import AdminRegistrationList from "../pages/admin/registrations/AdminRegistrationList";
import AdminRegistrationDetail from "../pages/admin/registrations/AdminRegistrationDetail";
import UserProfile from "../pages/user/profile/UserProfile";

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
                    <Route path="tentang-sekolah" element={<AboutSchoolPage />} />
                    <Route path="nilai-pendidikan" element={<NilaiPendidikanPage />} />
                    <Route path="kepala-sekolah" element={<KepalaSekolahPage />} />
                    <Route path="guru" element={<GuruPage />} />
                    <Route path="struktur-organisasi" element={<StrukturOrganisasiPage />} />
                    <Route path="legalitas" element={<LegalitasPage />} />
                    <Route path="lulusan" element={<LulusanPage />} />
                </Route>
                <Route path="/berita">
                    <Route index element={<BeritaPage />} />
                    <Route path=":slug" element={<BeritaDetailPage />} />
                </Route>
                <Route path="/kontak" element={<KontakPage />} />
                <Route path="/galeri" element={<GaleriPage />} />
                <Route path="/pendaftaran" element={<PendaftaranPage />} />

                {/* =============== */}
                {/* AUTH ROUTES */}
                {/* =============== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ganti-password" element={
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                } />
                <Route path="/forbidden" element={<Forbidden />} />

                {/* =============== */}
                {/* GURU ROUTES     */}
                {/* =============== */}
                <Route path="/guru">
                    <Route path="dashboard" element={
                        <ProtectedRoute role="guru">
                            <GuruDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="absensi" element={
                        <ProtectedRoute role="guru">
                            <AttendanceInput />
                        </ProtectedRoute>
                    } />
                    <Route path="nilai" element={
                        <ProtectedRoute role="guru">
                            <GradeInput />
                        </ProtectedRoute>
                    } />
                    <Route path="jadwal" element={
                        <ProtectedRoute role="guru">
                            <ScheduleList />
                        </ProtectedRoute>
                    } />
                    <Route path="rapor" element={
                        <ProtectedRoute role="guru">
                            <ReportCard />
                        </ProtectedRoute>
                    } />
                </Route>

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

                    {/* FAQ */}
                    <Route path="faq">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <FaqList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <FaqCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <FaqEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Galeri */}
                    <Route path="gallery">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <GalleryList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <GalleryCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <GalleryEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Kategori Galeri */}
                    <Route path="gallery-categories" element={
                        <ProtectedRoute role="admin">
                            <GalleryCategoryList />
                        </ProtectedRoute>
                    } />

                    {/* Profil Sekolah */}
                    {/* Kegiatan: Prestasi & Agenda Sekolah */}
                    {/* Master Data */}
                    <Route path="tahun-ajaran">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <AcademicYearList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <AcademicYearCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <AcademicYearEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="kelas">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <ClassroomList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <ClassroomCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <ClassroomEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Siswa */}
                    <Route path="siswa">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <StudentList />
                            </ProtectedRoute>
                        } />
                        <Route path=":id" element={
                            <ProtectedRoute role="admin">
                                <StudentDetail />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Penempatan Kelas */}
                    <Route path="penempatan-kelas" element={
                        <ProtectedRoute role="admin">
                            <ClassroomPlacementList />
                        </ProtectedRoute>
                    } />

                    <Route path="kegiatan">
                        <Route path=":type" element={
                            <ProtectedRoute role="admin">
                                <ActivityList />
                            </ProtectedRoute>
                        } />
                        <Route path=":type/create" element={
                            <ProtectedRoute role="admin">
                                <ActivityCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":type/:id/edit" element={
                            <ProtectedRoute role="admin">
                                <ActivityEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="profil-sekolah" element={
                        <ProtectedRoute role="admin">
                            <AboutSchoolList />
                        </ProtectedRoute>
                    } />

                    <Route path="nilai-pendidikan">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <EducationValueList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <EducationValueCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <EducationValueEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="kepala-sekolah">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <PrincipalList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <PrincipalCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <PrincipalEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="guru">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <TeacherList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <TeacherCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <TeacherEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="legalitas" element={
                        <ProtectedRoute role="admin">
                            <LegalityList />
                        </ProtectedRoute>
                    } />

                    <Route path="struktur-organisasi">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <OrganizationList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <OrganizationCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <OrganizationEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="kelulusan" element={
                        <ProtectedRoute role="admin">
                            <GraduationList />
                        </ProtectedRoute>
                    } />

                    <Route path="kenaikan-kelas" element={
                        <ProtectedRoute role="admin">
                            <PromotionList />
                        </ProtectedRoute>
                    } />

                    <Route path="lulusan" element={
                        <ProtectedRoute role="admin">
                            <GraduateList />
                        </ProtectedRoute>
                    } />

                    {/* Akademik Dasar */}
                    <Route path="mata-pelajaran">
                        <Route index element={
                            <ProtectedRoute role="admin">
                                <SubjectList />
                            </ProtectedRoute>
                        } />
                        <Route path="create" element={
                            <ProtectedRoute role="admin">
                                <SubjectCreate />
                            </ProtectedRoute>
                        } />
                        <Route path=":id/edit" element={
                            <ProtectedRoute role="admin">
                                <SubjectEdit />
                            </ProtectedRoute>
                        } />
                    </Route>

                    <Route path="nilai" element={
                        <ProtectedRoute role="admin">
                            <GradeInput />
                        </ProtectedRoute>
                    } />

                    <Route path="absensi" element={
                        <ProtectedRoute role="admin">
                            <AttendanceInput />
                        </ProtectedRoute>
                    } />

                    <Route path="jadwal" element={
                        <ProtectedRoute role="admin">
                            <ScheduleList />
                        </ProtectedRoute>
                    } />

                    <Route path="rapor" element={
                        <ProtectedRoute role="admin">
                            <ReportCard />
                        </ProtectedRoute>
                    } />

                    <Route path="dashboard-akademik" element={
                        <ProtectedRoute role="admin">
                            <AcademicDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="penugasan-guru" element={
                        <ProtectedRoute role="admin">
                            <TeacherAssignment />
                        </ProtectedRoute>
                    } />

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
                {/* 404 - URL TIDAK DIKENALI */}
                {/* ======================== */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
