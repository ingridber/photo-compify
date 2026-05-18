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
import SubmitToCompetition from './pages/SubmitToCompetitionPage';
import { SignOut } from './components/SignOut';
import { DeleteAccount } from './pages/DeleteAccount';
import { NavBar } from './components/nav-bar/NavBar';



function App() {

  const{setUser, setLoading} = useUser();

  useEffect(() => {
    async function fetchUser() {

      try {
        setLoading(true);

        const res = await getCurrentUser();

        if (res?.data) {
          setUser(res.data);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <>
      <Routes>

        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<SignIn/>}/>
        <Route path="/logout" element={<SignOut/>}/>
        <Route path={"/delete-account"} element={<DeleteAccount/>}/>
        <Route path="/register" element={<Register />}/>
        <Route path='/competitions' element={<CompetitionsPage />}/> 
        <Route path='/competitions/:id' element={<CompetitionPage />}/>
        <Route path="/image-upload" element={<ImageUpload />} />
        <Route path='/competitions/:id/submit' element={
          <ProtectedRoute>
            <SubmitToCompetition />
          </ProtectedRoute>
        } />

        <Route 
          path='/create-competition' 
          element={ 
            <ProtectedRoute>
              <CreateCompetitionPage />
            </ProtectedRoute>
            }>
        </Route>

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


        <NavBar/>
    </>
  )
}

export default App
