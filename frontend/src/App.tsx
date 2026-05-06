import './App.css';
import { Routes, Route } from 'react-router';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import Register from './pages/Register';
import CompetitionsPage from './components/competitions/CompetitionsPage';
import ImageUpload from "./pages/ImageUpload";
import { ManageAccount } from './pages/ManageAccount';
import { ChangeUsername } from './components/manage-account/ChangeUsername';
import { ChangePassword } from './components/manage-account/ChangePassword';
import { ChangeProfilePicture } from './components/manage-account/ChangeProfilePicture';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { getCurrentUser } from './services/api';
import CreateCompetitionPage from './pages/CreateCompetitionPage'
import CompetitionPage from './pages/CompetitionPage';


function App() {

  const{setUser} = useUser();

  useEffect(() => {
    async function fetchUser() {
      const res = await getCurrentUser();

      if (res?.data) {
        setUser(res.data);
      };
    };

    fetchUser();
  }, []);

  return (
    <>
      <Routes>

        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<SignIn/>}/>
        <Route path="/register" element={<Register />}/>
        <Route path='/competitions' element={<CompetitionsPage />}/> 
        <Route path='/competitions/:id' element={<CompetitionPage />}/>
        <Route path='/create-competition' element={<CreateCompetitionPage />}/> 
        <Route path="/image-upload" element={<ImageUpload />} />

        <Route path="/manage-account">
          <Route index element={
            <ProtectedRoute>
              <ManageAccount/>
            </ProtectedRoute>} />
          <Route path="change-username" element={
            <ProtectedRoute>
              <ChangeUsername/>
            </ProtectedRoute>} />
          <Route path="change-password" element={
            <ProtectedRoute>
              <ChangePassword/>
            </ProtectedRoute>} />
          <Route path="change-picture" element={
            <ProtectedRoute>
              <ChangeProfilePicture/>
            </ProtectedRoute>} />
          </Route>
        </Routes>
    </>
  )
}

export default App
