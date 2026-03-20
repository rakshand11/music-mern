import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Playlist from './pages/Playlist'
import { Toaster } from 'react-hot-toast'
import MusicPlayer from './components/MusicPlayer'
import CreatePlaylist from './pages/CreatePlaylist'
import Admin from './Admin/Admin'
import AdminLogin from './Admin/AdminLogin'

const Layout = () => {
  const location = useLocation()
  const hideNavbar = location.pathname === "/signup" || location.pathname === "/signin" || location.pathname === "/admin/login"

  return (
    <>
      <Toaster />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/playlist/:playlistId' element={<Playlist />} />
        <Route path='/playlist/create' element={<CreatePlaylist />} />
        <Route path='/playlist/:playlistId' element={<Playlist />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/admin/login' element={<AdminLogin />} />
      </Routes>
      {!hideNavbar && <MusicPlayer />}
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>)
}


export default App