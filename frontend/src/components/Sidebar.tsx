import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

type Playlist = {
    _id: string;
    name: string;
};

type Song = {
    _id: string;
    title: string;
};

const Sidebar = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user") || "null") // ✅ get user
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [recentSongs, setRecentSongs] = useState<Song[]>([]);

    // 🎵 Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user) return  // ✅ skip if not logged in
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

    // ⏱ Fetch recent songs
    useEffect(() => {
        const fetchRecentSongs = async () => {
            if (!user) return  // ✅ skip if not logged in
            try {
                const res = await axios.get(
                    "http://localhost:3000/song/get-all",
                    { withCredentials: true }
                );
                setRecentSongs(res.data.songs.slice(0, 3));
            } catch (error) {
                console.log(error);
            }
        };
        fetchRecentSongs();
    }, []);

    const handleCreatePlaylist = () => {
        navigate("/playlist/create")
    };

    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-5 flex flex-col">

            {/* 🎵 My Playlists */}
            {user ? (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">My Playlists</h2>
                        <button
                            onClick={handleCreatePlaylist}
                            className="bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>

                    {playlists.map((playlist) => (
                        <Link
                            key={playlist._id}
                            to={`/playlist/${playlist._id}`}
                            className="block p-2 rounded hover:bg-gray-800"
                        >
                            🎶 {playlist.name}
                        </Link>
                    ))}
                </div>
            ) : (
                // ✅ show login prompt if not logged in
                <div className="mb-6">
                    <p className="text-gray-500 text-sm">
                        <Link to="/signin" className="text-green-400 hover:underline">Sign in</Link> to see your playlists
                    </p>
                </div>
            )}

            {/* ❤️ Liked Songs — only for logged in users */}
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

            {/* ⏱ Recently Played — only for logged in users */}
            {user && (
                <div>
                    <h2 className="text-lg font-bold mb-3">Recently Played</h2>
                    {recentSongs.length === 0 ? (
                        <p className="text-gray-400 text-sm">No recent songs</p>
                    ) : (
                        recentSongs.map((song) => (
                            <div
                                key={song._id}
                                className="p-2 rounded hover:bg-gray-800 cursor-pointer"
                            >
                                ▶ {song.title}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;