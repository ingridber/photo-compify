import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import type { ComponentType } from 'react';

import Header from './components/header/Header';
import { NavBarMobile } from './components/nav-bar/NavBarMobile';
import { ProtectedRoute } from './components/ProtectedRoute';
import Footer from './components/footer/Footer';

import { useUser } from './hooks/useUser';
import { getCurrentUser } from './services/user';

// Pages
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import Register from './pages/Register';
import CompetitionsPage from './components/competitions/CompetitionsPage';
import CompetitionPage from './pages/CompetitionPage';
import SubmitToCompetition from './pages/SubmitToCompetitionPage';
import CreateCompetitionPage from './pages/CreateCompetitionPage';
import ImageUpload from './pages/ImageUpload';
import { ManageAccount } from './pages/ManageAccount';
import { ProfilePage } from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import { DeleteAccount } from './components/manage-account/DeleteAccount';
import Faq from './pages/Faq';
import Admin from './pages/Admin';
import Gdpr from './pages/Gdpr';
import HandleReports from './pages/HandleReports';
import Guidelines from './pages/Guidelines';

// Components
import { ChangeUsername } from './components/manage-account/ChangeUsername';
import { ChangePassword } from './components/manage-account/ChangePassword';
import { ChangeProfilePicture } from './components/manage-account/ChangeProfilePicture';
import ProfileSubmissions from './components/profile/ProfileSubmissions';
import ProfileCompetitions from './components/profile/ProfileCompetitions';
import Users from './components/admin/Users';

const protectedElement = (Component: ComponentType) => (
  <ProtectedRoute>
    <Component />
  </ProtectedRoute>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { setUser, setLoading } = useUser();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getCurrentUser();
        if (res) setUser(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
  <div className="app">
    <ScrollToTop />
    <Header />

    <main className="mainContent">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/image-upload" element={<ImageUpload />} />

        {/* competitions */}
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/competitions/:id" element={<CompetitionPage />} />
        <Route
          path="/competitions/:id/submit"
          element={protectedElement(SubmitToCompetition)}
        />
        <Route
          path="/create-competition"
          element={protectedElement(CreateCompetitionPage)}
        />

        {/* profile */}
        <Route path="/profile" element={protectedElement(ProfilePage)}>
          <Route index element={<ProfileSubmissions />} />
          <Route path="competitions" element={<ProfileCompetitions />} />
          <Route path="wins" element={<ProfileSubmissions showOnlyWins />} />
        </Route>

        <Route path="/users/:username" element={<PublicProfilePage />} />

        {/* account */}
        <Route path="/profile/account" element={protectedElement(ManageAccount)}>
          <Route path="change-username" element={protectedElement(ChangeUsername)} />
          <Route path="change-password" element={protectedElement(ChangePassword)} />
          <Route path="change-picture" element={protectedElement(ChangeProfilePicture)} />
          <Route path="delete-account" element={protectedElement(DeleteAccount)} />
        </Route>

        {/* footer */}
        <Route path="/faq" element={<Faq />} />
        <Route path="/gdpr" element={<Gdpr />} />
        <Route path="/guidelines" element={<Guidelines />} />

        {/* admin  */}
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path='users' element={<Users />} />
          <Route path="reports" element={<HandleReports />} />
        </Route>

      </Routes>
    </main>

    <NavBarMobile />
    <Footer />
  </div>
);
}

export default App;
