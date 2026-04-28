import './App.css'
import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { SignIn } from './pages/SignIn'
import Register from './pages/Register'
import EditProfile from './components/EditProfile' 
import CompetitionsPage from './components/competitions/CompetitionsPage'
import { ManageAccount } from './pages/ManageAccount'
import { ChangeUsername } from './components/manage-account/ChangeUsername'

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<SignIn/>}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/edit-profile" element={<EditProfile />}/> 
          <Route path='/competitions' element={<CompetitionsPage />}/> 

          <Route path="/manage-account">
            <Route index element={<ManageAccount/>} />
            <Route path="change-username" element={<ChangeUsername />} />
          </Route>


        </Routes>
    </>
  )
}

export default App