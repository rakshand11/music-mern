import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Play, Trash2, Plus, X, Search, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";

type Song = {
    _id: string;
    title: string;
    artist: string;
    duration: number;
    imageUrl: string;
    audioUrl: string;
};

type Playlist = {
    _id: string;
    name: string;
    coverImage: string;
    songs: Song[];
};

const Playlist = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { playQueue } = usePlayer() // ✅ changed from playSong to playQueue

    // schedule states
    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [scheduledTime, setScheduledTime] = useState("");

    // fetch playlist
    const fetchPlaylist = async () => {
        try {
            const res = await axios.get(
                `http://localhost:3000/playlist/get/${playlistId}`,
                { withCredentials: true }
            );
            setPlaylist(res.data.playlist);
        } catch (error) {
            console.log(error);
        }
    };

    // fetch all songs for modal
    const fetchAllSongs = async () => {
        try {
            const res = await axios.get("http://localhost:3000/song/get-all");
            setAllSongs(res.data.songs);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchPlaylist();
        fetchAllSongs();
    }, [playlistId]);

    // add song to playlist
    const handleAddSong = async (songId: string) => {
        try {
            await axios.post(
                `http://localhost:3000/playlist/add-song/${playlistId}`,
                { songs: songId },
                { withCredentials: true }
            );
            toast.success("Song added to playlist!");
            fetchPlaylist();
            setShowModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to add song");
        }
    };

    // remove song from playlist
    const handleRemoveSong = async (songId: string) => {
        try {
            await axios.delete(
                `http://localhost:3000/playlist/remove-song/${playlistId}`,
                { data: { songs: songId }, withCredentials: true }
            );
            toast.success("Song removed!");
            fetchPlaylist();
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to remove song");
        }
    };

    // schedule song
    const handleSchedule = async () => {
        if (!selectedSong || !scheduledTime) {
            toast.error("Please select a time");
            return;
        }
        try {
            await axios.post(
                "http://localhost:3000/schedule/create",
                { song: selectedSong._id, scheduledTime },
                { withCredentials: true }
            );
            toast.success("Song scheduled!");
            setShowSchedule(false);
            setScheduledTime("");
            setSelectedSong(null);
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to schedule");
        }
    };

    // filter songs in modal
    const filteredSongs = allSongs.filter(
        (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!playlist) return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-8">

            {/* Playlist Header */}
            <div className="flex items-end gap-8 mb-10">
                <img
                    src={playlist.coverImage || "https://via.placeholder.com/200"}
                    alt={playlist.name}
                    className="w-48 h-48 rounded-2xl object-cover shadow-2xl"
                />
                <div>
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Playlist</p>
                    <h1 className="text-5xl font-black text-white mb-4">{playlist.name}</h1>
                    <p className="text-gray-400">{playlist.songs.length} songs</p>
                </div>
            </div>

            {/* Add Songs Button */}
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold mb-8 transition"
            >
                <Plus size={20} />
                Add Songs
            </button>

            {/* Songs List */}
            <div className="space-y-2">
                {playlist.songs.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No songs yet — add some!</p>
                ) : (
                    playlist.songs.map((song, index) => (
                        <div
                            key={song._id}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition group"
                        >
                            {/* Index / Play */}
                            <span className="text-gray-500 w-6 text-center group-hover:hidden">{index + 1}</span>
                            <Play
                                size={16}
                                className="text-green-500 hidden group-hover:block w-6 cursor-pointer"
                                onClick={() => playQueue(playlist.songs, index)} // ✅ updated
                            />

                            {/* Image */}
                            <img
                                src={song.imageUrl || "https://via.placeholder.com/50"}
                                alt={song.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />

                            {/* Info */}
                            <div className="flex-1">
                                <p className="text-white font-medium">{song.title}</p>
                                <p className="text-gray-400 text-sm">{song.artist}</p>
                            </div>

                            {/* Duration */}
                            <span className="text-gray-400 text-sm">{song.duration}s</span>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => { setSelectedSong(song); setShowSchedule(true); }}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-green-400 transition"
                                    title="Schedule"
                                >
                                    <Clock size={18} />
                                </button>

                                <button
                                    onClick={() => handleRemoveSong(song._id)}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition"
                                    title="Remove"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Songs Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add Songs</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search songs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
                            />
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {filteredSongs.map((song) => (
                                <div
                                    key={song._id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                                    onClick={() => handleAddSong(song._id)}
                                >
                                    <img
                                        src={song.imageUrl || "https://via.placeholder.com/40"}
                                        alt={song.title}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{song.title}</p>
                                        <p className="text-gray-400 text-xs">{song.artist}</p>
                                    </div>
                                    <Plus size={18} className="text-green-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showSchedule && selectedSong && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Schedule Song</h2>
                            <button onClick={() => setShowSchedule(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-4 p-3 bg-gray-700 rounded-xl flex items-center gap-3">
                            <img
                                src={selectedSong.imageUrl || "https://via.placeholder.com/40"}
                                alt={selectedSong.title}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                                <p className="text-white font-medium">{selectedSong.title}</p>
                                <p className="text-gray-400 text-sm">{selectedSong.artist}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-gray-400 text-sm mb-2 block">Schedule Date & Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSchedule(false)}
                                className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition"
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;