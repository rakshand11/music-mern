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
import Schedule from './pages/Schedule'
import ProtectedRoute from './components/ProtectedRoute'
import LikedSongs from './pages/LikeSongs'

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
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path='/playlist/create' element={<ProtectedRoute><CreatePlaylist /></ProtectedRoute>} />
        <Route path='/playlist/:playlistId' element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
        <Route path='/schedule' element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/liked-songs' element={<ProtectedRoute><LikedSongs /></ProtectedRoute>} />

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