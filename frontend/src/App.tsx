import './App.css'
import { Routes, Route } from 'react-router'
import { Home } from './pages/Home'
import { SignIn } from './pages/Login'

function App() {

  return (
    <>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<SignIn/>}/>
        </Routes>
    </>
  )
}

export default App
