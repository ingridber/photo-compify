import './App.css'
import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { SignIn } from './pages/Login'
import Register from './pages/Register'
import EditProfile from './components/EditProfile' 
import CompetitionsPage from './components/competitions/CompetitionsPage'
import { ManageAccount } from './pages/ManageAccount'

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<SignIn/>}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/edit-profile" element={<EditProfile />}/> 
          <Route path='/competitions' element={<CompetitionsPage />}/> 

          <Route path="/manage-account" element={<ManageAccount />}/>
          <Route path='/manage-account/change-username' element={<EditProfile />}/>

        </Routes>
    </>
  )
}

export default App