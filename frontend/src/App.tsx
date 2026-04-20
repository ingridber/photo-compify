import './App.css'
import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { SignIn } from './pages/Login'
import Register from './pages/Register'


function App() {

  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<SignIn/>}/>
          <Route path="/register" element={<Register />}/>
        </Routes>
    </>
  )
}

export default App
