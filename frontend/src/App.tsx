import React from "react";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Playlist from "./pages/Playlist";
import { Toaster } from "react-hot-toast";
import MusicPlayer from "./components/MusicPlayer";
import CreatePlaylist from "./pages/CreatePlaylist";
import Admin from "./Admin/Admin";
import Schedule from "./pages/Schedule";
import ProtectedRoute from "./components/ProtectedRoute";
import LikedSongs from "./pages/LikeSongs";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== "admin") {
    return <Navigate to="/signin" />;
  }

  return <>{children}</>;
};

const Layout = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/signup" ||
    location.pathname === "/signin";

  return (
    <>
      <Toaster />

      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* User Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/playlist/create" element={<ProtectedRoute><CreatePlaylist /></ProtectedRoute>} />
        <Route path="/playlist/:playlistId" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/liked-songs" element={<ProtectedRoute><LikedSongs /></ProtectedRoute>} />

        {/* Admin Protected Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!hideNavbar && <MusicPlayer />}
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
};

export default App;