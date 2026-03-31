import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    Home,
    LogOut,
    Shield,
    X,
    Clock,
    Play
} from "lucide-react";
import api from "../aiosInstance";
import toast from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";

interface Song {
    _id: string;
    title: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    duration: number;
}

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

const Navbar: React.FC = () => {
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

    const searchRef = useRef<HTMLDivElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem("user") || "null"));
            setAdmin(JSON.parse(localStorage.getItem("admin") || "null"));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await api.post("/user/logout");
            localStorage.removeItem("user");
            localStorage.removeItem("recentSongs");
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
            const res = await api.put<{ user: User }>("/user/update", formData);
            const updatedUser: User = { ...user, avatar: res.data.user.avatar };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success("Profile picture updated!");
            e.target.value = "";
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
        }
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        const timeout = setTimeout(async () => {
            try {
                setSearching(true);
                const res = await api.get<{ songs: Song[] }>(
                    `/song/search?query=${encodeURIComponent(searchQuery)}`
                );
                setSearchResults(res.data.songs.slice(0, 6));
                setShowResults(true);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const SearchResultItem = React.memo(({ song }: { song: Song }) => (
        <div
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 cursor-pointer transition"
            onClick={() => {
                playSong(song);
                setShowResults(false);
                setSearchQuery("");
            }}
        >
            <img
                src={song.imageUrl || "https://via.placeholder.com/40"}
                alt={song.title}
                className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{song.title}</p>
                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
            </div>
            <Play size={16} className="text-emerald-400" />
        </div>
    ));

    return (
        <nav className="w-full px-4 py-3 bg-black/80 backdrop-blur-xl flex items-center justify-between relative z-40">
            <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl">🎵</span>
                    <h1 className="text-xl text-white font-bold hidden md:block">MusicTune</h1>
                </Link>

                <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400">
                    <Home size={18} />
                    <span className="hidden sm:inline">Home</span>
                </Link>

                {admin && (
                    <Link to="/admin" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400">
                        <Shield size={18} />
                        <span className="hidden md:inline">Admin</span>
                    </Link>
                )}
            </div>

            <div className="relative flex-1 max-w-md mx-6 hidden md:flex" ref={searchRef}>
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-black/50 border border-white/20 rounded-full text-white"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(""); setShowResults(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        <X size={16} />
                    </button>
                )}
                {showResults && (
                    <div className="absolute top-12 left-0 right-0 bg-black border border-white/10 rounded-xl max-h-64 overflow-y-auto z-50">
                        {searching && <p className="text-gray-400 p-4">Searching...</p>}
                        {!searching && searchResults.map((song) => (
                            <SearchResultItem key={song._id} song={song} />
                        ))}
                        {!searching && searchResults.length === 0 && (
                            <p className="text-gray-400 p-4">No results</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 relative">
                {user ? (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />

                        <div onClick={() => setOpen(!open)} className="cursor-pointer">
                            {user.avatar ? (
                                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white rounded-full font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {open && (
                            <div className="absolute right-0 top-14 bg-black border border-white/10 rounded-xl w-60 p-3 z-50 pointer-events-auto shadow-lg">
                                <div className="mb-3 px-2">
                                    <p className="text-white font-medium">{user.name}</p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>

                                <Link
                                    to="/schedule"
                                    onClick={(e) => {
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition w-full"
                                >
                                    <Clock size={16} /> My Schedule
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition w-full mt-1"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="text-gray-300">Sign In</Link>
                        <Link to="/signup" className="bg-emerald-500 text-white px-4 py-2 rounded">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;