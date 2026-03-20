import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, LogOut, Shield, X, Clock, Camera } from "lucide-react";
import axios from "axios"
import toast from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";

type Song = {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    duration: number;
}

const Navbar = () => {
    const navigate = useNavigate();
    const { playSong } = usePlayer()
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
    const admin = JSON.parse(localStorage.getItem("admin") || "null");

    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true })
            localStorage.removeItem("user");
            setUser(null);
            setOpen(false);
            navigate("/signin");
        } catch (error) {
            toast.error("Can't logout")
        }
    };

    // ✅ handle avatar upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploadingAvatar(true)
            const formData = new FormData()
            formData.append("avatar", file)

            const res = await axios.put(
                "http://localhost:3000/user/update",
                formData,
                { withCredentials: true }
            )

            // ✅ update localStorage and state
            const updatedUser = { ...user, avatar: res.data.user.avatar }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            setUser(updatedUser)
            toast.success("Avatar updated!")
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to update avatar")
        } finally {
            setUploadingAvatar(false)
        }
    }

    // search songs with debounce
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await axios.get(
                    `http://localhost:3000/song/search?query=${searchQuery}`
                );
                setSearchResults(res.data.songs);
                setShowResults(true);
            } catch (error) {
                console.log(error);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="w-full px-6 py-3 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-40">

            {/* Left Section */}
            <div className="flex items-center space-x-6">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-2xl">🎵</span>
                    <h1 className="text-xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-emerald-700 transition-all duration-300">
                        Music Tune
                    </h1>
                </Link>

                <Link
                    to="/"
                    className="flex items-center space-x-1 text-gray-600 hover:text-green-600 font-medium transition-colors duration-200"
                >
                    <Home size={18} />
                    <span>Home</span>
                </Link>

                {admin && (
                    <Link
                        to="/admin"
                        className="flex items-center space-x-1 text-gray-600 hover:text-green-600 font-medium transition-colors duration-200"
                    >
                        <Shield size={18} />
                        <span>Admin</span>
                    </Link>
                )}
            </div>

            {/* Center Section (Search) */}
            <div className="relative w-1/3" ref={searchRef}>
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search songs, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(""); setShowResults(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Search Results Dropdown */}
                {showResults && (
                    <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto">
                        {searching && (
                            <div className="flex items-center justify-center py-6">
                                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {!searching && searchResults.length === 0 && (
                            <p className="text-gray-500 text-center py-6 text-sm">No songs found</p>
                        )}

                        {!searching && searchResults.map((song) => (
                            <div
                                key={song._id}
                                onClick={() => {
                                    playSong(song)
                                    setShowResults(false)
                                    setSearchQuery("")
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            >

                                <img
                                    src={song.imageUrl || "https://via.placeholder.com/40"}
                                    alt={song.title}
                                    className="w-10 h-10 rounded-lg object-cover"
                                />

                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium text-sm">{song.title}</p>
                                    <p className="text-gray-400 text-xs">{song.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                {user ? (
                    <>
                        {/* Hidden file input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />

                        {/* Avatar */}
                        <div className="relative">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    onClick={() => setOpen(!open)}
                                    className="w-10 h-10 rounded-full border-2 border-green-400 cursor-pointer hover:border-green-600 transition-all duration-300 shadow-sm object-cover"
                                />
                            ) : (
                                <div
                                    onClick={() => setOpen(!open)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                                >
                                    {uploadingAvatar
                                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : user.name?.charAt(0)?.toUpperCase()
                                    }
                                </div>
                            )}
                        </div>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute right-0 top-14 bg-white shadow-xl rounded-2xl w-52 py-2 z-50 border border-gray-100">

                                {/* User Info + Avatar Upload */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        {/* Avatar with camera icon */}
                                        <div className="relative">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt="avatar"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                            {/* ✅ Camera button */}
                                            <button
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                                            >
                                                {uploadingAvatar
                                                    ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                    : <Camera size={10} className="text-white" />
                                                }
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-800 font-semibold text-sm truncate">{user.name}</p>
                                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* My Schedules */}
                                <Link
                                    to="/schedule"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition-colors"
                                >
                                    <Clock size={14} />
                                    My Schedules
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 transition-colors duration-200 rounded-b-2xl"
                                >
                                    <LogOut size={16} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to="/signin"
                            className="text-gray-600 hover:text-green-600 font-medium transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105"
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;