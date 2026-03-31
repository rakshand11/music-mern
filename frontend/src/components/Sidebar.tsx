import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Play,
    Heart,
    Clock,
    Plus,
    Music,
    Home,
    ChevronRight,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import toast from "react-hot-toast";
import api from "../aiosInstance";


type Playlist = {
    _id: string;
    name: string;
};

type Song = {
    _id: string;
    title: string;
    imageUrl: string;
    audioUrl: string;
    artist: string;
    duration: number;
};

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const { playSong } = usePlayer();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);
    const [likedSongsCount, setLikedSongsCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const user = JSON.parse(localStorage.getItem("user") || "null") as
        | { _id: string }
        | null;

    const fetchPlaylists = useCallback(async () => {
        if (!user?._id) return;
        try {
            const res = await api.get("/playlist/get-allplaylist");
            setPlaylists(res.data.playlists);
        } catch (error) {
            toast.error("Failed to load playlists");
        }
    }, [user?._id]);

    useEffect(() => {
        fetchPlaylists();
    }, [fetchPlaylists]);

    useEffect(() => {
        const load = () => {
            const updated = JSON.parse(localStorage.getItem("recentSongs") || "[]") as Song[]
            setRecentSongs(updated.slice(0, 5))
        }

        load() // load on mount
        window.addEventListener("storage-recent-update", load)
        return () => window.removeEventListener("storage-recent-update", load)
    }, [])

    useEffect(() => {
        const liked = JSON.parse(localStorage.getItem("likedSongs") || "[]") as Song[];
        setLikedSongsCount(liked.length);
    }, []);

    const handleCreatePlaylist = useCallback(() => {
        navigate("/playlist/create");
    }, [navigate]);

    const handlePlayRecentSong = useCallback((song: Song) => {
        playSong(song);
    }, [playSong]);

    const NavItem = ({
        icon: Icon,
        label,
        active = false,
        badge,
        onClick,
        to,
    }: {
        icon: React.ElementType;
        label: string;
        active?: boolean;
        badge?: number;
        onClick?: () => void;
        to?: string;
    }) => (
        <Link
            to={to || "#"}
            onClick={onClick}
            className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${active
                ? "bg-gradient-to-r from-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 shadow-emerald-500/25 shadow-lg"
                : "hover:bg-white/5 hover:shadow-lg hover:shadow-purple-500/10 hover:border-white/20 border border-transparent"
                }`}
        >
            <Icon
                size={20}
                className={`${active
                    ? "text-emerald-400 drop-shadow-lg"
                    : "text-gray-300 group-hover:text-white"
                    } transition-colors`}
            />
            <span
                className={`font-medium text-sm transition-all ${active
                    ? "text-white"
                    : "text-gray-300 group-hover:text-white"
                    } ${isExpanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-2 pointer-events-none"
                    }`}
            >
                {label}
            </span>

            {badge !== undefined && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {badge > 99 ? "99+" : badge}
                </span>
            )}
            <div
                className={`absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-all ${active ? "opacity-100" : ""
                    }`}
            />
        </Link>
    );

    return (
        <div
            className={`bg-gradient-to-b from-gray-900/95 via-black/50 to-gray-900/80 backdrop-blur-xl h-screen flex flex-col transition-all duration-300 overflow-hidden border-r border-white/10 shadow-2xl shadow-black/50 ${isExpanded ? "w-72" : "w-20"
                }`}
        >
            <div className="p-4 border-b border-white/10 sticky top-0 bg-black/30 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/25">
                        <Music size={24} className="text-white drop-shadow-lg" />
                    </div>
                    <div
                        className={`flex flex-col overflow-hidden transition-all ${isExpanded ? "w-48" : "w-0"
                            }`}
                    >
                        <h1 className="text-xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                            MusicTune
                        </h1>
                        <p className="text-xs text-purple-400 font-medium">
                            Premium Sound
                        </p>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-auto p-1.5 hover:bg-white/10 rounded-xl transition-all hover:scale-110 group"
                        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <ChevronRight
                            size={18}
                            className={`text-gray-400 group-hover:text-white transition-transform ${isExpanded ? "rotate-0" : "rotate-180"
                                }`}
                        />
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-1 flex-1 overflow-y-auto">
                <NavItem
                    icon={Home}
                    label="Home"
                    active={window.location.pathname === "/"}
                    to="/"
                />

                {user && (
                    <>
                        <NavItem
                            icon={Heart}
                            label="Liked Songs"
                            badge={
                                likedSongsCount > 0
                                    ? likedSongsCount
                                    : undefined
                            }
                            to="/liked-songs"
                            active={
                                window.location.pathname === "/liked-songs"
                            }
                        />

                        <div className={`${isExpanded ? "block" : "hidden"}`}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    My Playlists
                                </h3>
                                <button
                                    onClick={handleCreatePlaylist}
                                    className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-lg hover:shadow-emerald-500/25"
                                    title="Create Playlist"
                                >
                                    <Plus size={16} className="text-white" />
                                </button>
                            </div>

                            {playlists.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-xs">
                                        No playlists yet
                                    </p>
                                    <button
                                        onClick={handleCreatePlaylist}
                                        className="mt-2 text-emerald-400 text-xs font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                                    >
                                        Create first playlist
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                                    {playlists.slice(0, 4).map((playlist) => (
                                        <NavItem
                                            key={playlist._id}
                                            icon={Music}
                                            label={playlist.name}
                                            to={`/playlist/${playlist._id}`}
                                            active={
                                                window.location.pathname ===
                                                `/playlist/${playlist._id}`
                                            }
                                        />
                                    ))}
                                    {playlists.length > 4 && (
                                        <div
                                            className={`text-xs text-gray-500 p-2 rounded-xl bg-white/5 ${isExpanded ? "block" : "hidden"
                                                }`}
                                        >
                                            +{playlists.length - 4} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={`${isExpanded ? "block" : "hidden"}`}>
                            <div className="flex items-center justify-between mb-2 px-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Clock size={12} /> Recently Played
                                </h3>
                            </div>

                            <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                                {recentSongs.length === 0 ? (
                                    <p className="text-gray-500 text-xs px-1">
                                        No recent songs
                                    </p>
                                ) : (
                                    recentSongs.map((song) => (
                                        <div
                                            key={song._id}
                                            onClick={() =>
                                                handlePlayRecentSong(song)
                                            }
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 hover:shadow-md hover:shadow-emerald-500/20 cursor-pointer transition-all group border border-transparent hover:border-emerald-400/30 backdrop-blur-sm"
                                        >
                                            <img
                                                src={
                                                    song.imageUrl ||
                                                    "https://via.placeholder.com/36?text=?"
                                                }
                                                alt={song.title}
                                                className="w-9 h-9 rounded-lg object-cover shadow-md ring-1 ring-white/20 group-hover:ring-emerald-400/30 transition-all"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate group-hover:text-emerald-300 transition-colors">
                                                    {song.title}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {song.artist}
                                                </p>
                                            </div>
                                            <Play
                                                size={14}
                                                className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!user && (
                <div className="p-4 border-t border-white/10 sticky bottom-0 bg-black/30 backdrop-blur-sm z-10">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Music size={20} className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">
                            <Link
                                to="/signin"
                                className="text-emerald-400 font-medium hover:underline hover:text-emerald-300 transition-colors"
                            >
                                Sign in
                            </Link>{" "}
                            to see your playlists & liked songs
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;