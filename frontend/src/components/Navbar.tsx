import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Home,
    LogOut,
    Shield,
    X,
    Clock,
    Camera,
    User,
    ChevronDown,
    Play
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";

type Song = {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    duration: number;
};

type User = {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
};

interface NavbarProps { }

const Navbar: React.FC<NavbarProps> = () => {
    const navigate = useNavigate();
    const { playSong } = usePlayer();

    const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem("user") || "null"));
    const [admin, setAdmin] = useState<any>(JSON.parse(localStorage.getItem("admin") || "null"));
    const [open, setOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [searching, setSearching] = useState<boolean>(false);
    const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Listen for storage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "null"));
            setAdmin(JSON.parse(localStorage.getItem("admin") || "null"));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
            localStorage.removeItem("user");
            setUser(null);
            setOpen(false);
            navigate("/signin");
            toast.success("Logged out successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Logout failed");
        }
    }, [navigate]);

    const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setUploadingAvatar(true);
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await axios.put<{ user: User }>(
                "http://localhost:3000/user/update",
                formData,
                { withCredentials: true }
            );

            const updatedUser: User = { ...user, avatar: res.data.user.avatar };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success("Profile picture updated! ✨");
            e.target.value = ''; // Reset input
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
        }
    }, [user]);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await axios.get<{ songs: Song[] }>(
                    `http://localhost:3000/song/search?query=${encodeURIComponent(searchQuery)}`
                );
                setSearchResults(res.data.songs.slice(0, 6)); // Limit results
                setShowResults(true);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Close dropdowns on outside click
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

    const SearchResultItem = React.memo(({ song }: { song: Song }) => (
        <div
            className="group relative flex items-center gap-3 px-4 py-3 hover:bg-white/10 backdrop-blur-sm cursor-pointer transition-all hover:translate-x-1 border-l-4 border-transparent hover:border-emerald-400 hover:shadow-md rounded-r-2xl"
            onClick={() => {
                playSong(song);
                setShowResults(false);
                setSearchQuery("");
            }}
        >
            <img
                src={song.imageUrl || "https://via.placeholder.com/40?text=??"}
                alt={song.title}
                className="w-10 h-10 rounded-xl object-cover shadow-lg ring-1 ring-white/20 group-hover:ring-emerald-400/40 transition-all"
            />
            <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate group-hover:text-emerald-300 transition-colors drop-shadow-lg">
                    {song.title}
                </p>
                <p className="text-gray-300 text-xs truncate">{song.artist}</p>
            </div>
            <Play size={16} className="text-emerald-400 opacity-0 group-hover:opacity-100 ml-auto transition-all" />
        </div>
    ));

    return (
        <nav className="w-full px-4 md:px-6 py-3 lg:py-4 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40 sticky top-0 z-50 flex items-center justify-between">

            {/* Left Section - Logo & Nav */}
            <div className="flex items-center space-x-4 md:space-x-6">
                <Link to="/" className="group flex items-center gap-2.5 p-2 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-all">
                        <span className="text-xl">🎵</span>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-r from-emerald-400 via-white to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
                            MusicTune
                        </h1>
                        <p className="text-xs text-gray-400 font-medium tracking-wider -mt-1">Premium Sound</p>
                    </div>
                </Link>

                <Link
                    to="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-emerald-400 hover:bg-white/10 backdrop-blur-sm font-medium transition-all shadow-md hover:shadow-emerald-500/20 group"
                    title="Home"
                >
                    <Home size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                {admin && (
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-emerald-400 hover:bg-white/10 backdrop-blur-sm font-medium transition-all shadow-md hover:shadow-emerald-500/20"
                        title="Admin Panel"
                    >
                        <Shield size={18} />
                        <span className="hidden md:inline">Admin</span>
                    </Link>
                )}
            </div>

            {/* Center Section - Enhanced Search */}
            <div className="relative flex-1 max-w-md mx-8 hidden md:flex" ref={searchRef}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search size={18} className="text-white group-hover:text-emerald-400 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search songs, artists, playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-black/50 backdrop-blur-xl border border-white/20 hover:border-emerald-400/50 focus:border-emerald-400 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all text-white placeholder-gray-400 font-medium shadow-xl"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(""); setShowResults(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:rotate-90 transition-all p-1"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Glassmorphism Search Results */}
                {showResults && (
                    <div className="absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 max-h-80 overflow-y-auto z-50 animate-in slide-in-from-top duration-200">
                        <div className="p-2 border-b border-white/5">
                            <p className="text-xs text-gray-400 px-2 uppercase tracking-wider font-bold">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        {searching && (
                            <div className="flex items-center justify-center py-8">
                                <div className="relative">
                                    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-lg" />
                                    <div className="absolute inset-0 w-8 h-8 border-2 border-white/20 rounded-full animate-ping" />
                                </div>
                            </div>
                        )}
                        {!searching && searchResults.map((song) => (
                            <SearchResultItem key={song._id} song={song} />
                        ))}
                        {!searching && searchResults.length === 0 && (
                            <p className="text-gray-400 text-center py-8 text-sm">No songs found</p>
                        )}
                    </div>
                )}
            </div>

            {/* Right Section - User Profile */}
            <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
                {user ? (
                    <>
                        {/* Hidden avatar input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />

                        {/* Enhanced Avatar */}
                        <div className="relative group">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    onClick={() => setOpen(!open)}
                                    className="w-11 h-11 rounded-2xl object-cover border-3 border-emerald-400/50 cursor-pointer hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 shadow-xl ring-2 ring-white/20 hover:ring-emerald-400/40"
                                    loading="lazy"
                                />
                            ) : (
                                <div
                                    onClick={() => setOpen(!open)}
                                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer relative hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300 shadow-xl ring-2 ring-white/20 hover:ring-emerald-400/40 overflow-hidden"
                                >
                                    {uploadingAvatar ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        user.name?.charAt(0)?.toUpperCase() || 'U'
                                    )}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                                <Camera size={12} className="text-white" />
                            </div>
                        </div>

                        {/* Glassmorphism Dropdown */}
                        {open && (
                            <div className="absolute right-0 top-16 w-72 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50 rounded-3xl border border-white/10 p-1 animate-in slide-in-from-top duration-200 z-50">
                                {/* User Profile Card */}
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/20 mb-1">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Profile"
                                                className="w-14 h-14 rounded-2xl object-cover border-3 border-emerald-400/50 shadow-2xl ring-2 ring-white/30"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-2xl ring-2 ring-white/30">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-lg truncate drop-shadow-lg">{user.name}</p>
                                            <p className="text-gray-300 text-sm truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all hover:scale-110 shadow-md"
                                            title="Change profile picture"
                                        >
                                            {uploadingAvatar ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Camera size={16} className="text-emerald-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-1 p-2">
                                    <Link
                                        to="/schedule"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 backdrop-blur-sm rounded-2xl text-gray-200 hover:text-emerald-300 font-medium transition-all hover:translate-x-1 shadow-md hover:shadow-emerald-500/20"
                                    >
                                        <Clock size={18} />
                                        My Schedules
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 text-red-300 hover:text-red-100 font-bold rounded-2xl transition-all hover:translate-x-1 shadow-md hover:shadow-red-500/20"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to="/signin"
                            className="px-4 py-2 text-gray-300 hover:text-emerald-400 font-medium transition-all hover:scale-105 backdrop-blur-sm"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-emerald-500/30 hover:scale-105 backdrop-blur-sm border border-emerald-500/50"
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
