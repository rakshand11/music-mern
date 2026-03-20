import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

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

const Sidebar = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user") || "null")
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);
    const { playSong } = usePlayer()

    // 🎵 Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) return
            try {
                const res = await axios.get(
                    "http://localhost:3000/playlist/get-allplaylist",
                    { withCredentials: true }
                );
                setPlaylists(res.data.playlists);
            } catch (error) {
                console.log(error);
            }
        };
        fetchPlaylists();
    }, []);

    // ✅ Read recently played from localStorage
    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem("recentSongs") || "[]")
        setRecentSongs(recent)
    }, [])

    const handleCreatePlaylist = () => {
        navigate("/playlist/create")
    };

    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col overflow-y-auto">

            {/* 🎵 My Playlists */}
            {user ? (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">My Playlists</h2>
                        <button
                            onClick={handleCreatePlaylist}
                            className="bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center transition"
                        >
                            +
                        </button>
                    </div>

                    {playlists.length === 0 && (
                        <p className="text-gray-500 text-sm">No playlists yet</p>
                    )}

                    {playlists.map((playlist) => (
                        <Link
                            key={playlist._id}
                            to={`/playlist/${playlist._id}`}
                            className="block p-2 rounded hover:bg-gray-800 text-sm truncate"
                        >
                            🎶 {playlist.name}
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="mb-6">
                    <p className="text-gray-500 text-sm">
                        <Link to="/signin" className="text-green-400 hover:underline">Sign in</Link> to see your playlists
                    </p>
                </div>
            )}

            {/* ❤️ Liked Songs */}
            {user && (
                <div className="mb-6">
                    <Link
                        to="/liked-songs"
                        className="block p-2 rounded hover:bg-gray-800 text-green-400"
                    >
                        ❤️ Liked Songs
                    </Link>
                </div>
            )}

            {/* ⏱ Recently Played */}
            {user && (
                <div>
                    <h2 className="text-lg font-bold mb-3">Recently Played</h2>
                    {recentSongs.length === 0 ? (
                        <p className="text-gray-400 text-sm">No recent songs</p>
                    ) : (
                        recentSongs.map((song) => (
                            <div
                                key={song._id}
                                onClick={() => playSong(song)}  // ✅ click to play
                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer group"
                            >
                                <img
                                    src={song.imageUrl || "https://via.placeholder.com/32"}
                                    alt={song.title}
                                    className="w-8 h-8 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{song.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;