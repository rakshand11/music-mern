import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Heart, Play, Clock, X } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

type Song = {
    _id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    imageUrl: string;
    audioUrl: string;
}

const LikedSongs = () => {
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const { playQueue } = usePlayer()
    const navigate = useNavigate()

    // schedule states
    const [showSchedule, setShowSchedule] = useState(false)
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [scheduledTime, setScheduledTime] = useState("")

    const fetchLikedSongs = async () => {
        try {
            const res = await axios.get(
                "http://localhost:3000/user/liked-songs",
                { withCredentials: true }
            )
            setSongs(res.data.songs)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLikedSongs()
    }, [])

    const handleUnlike = async (songId: string) => {
        try {
            await axios.post(
                `http://localhost:3000/user/like/${songId}`,
                {},
                { withCredentials: true }
            )
            toast.success("Removed from liked songs")
            setSongs(prev => prev.filter(s => s._id !== songId))
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed")
        }
    }

    const handleSchedule = async () => {
        if (!selectedSong || !scheduledTime) {
            toast.error("Please select a time")
            return
        }
        try {
            await axios.post(
                "http://localhost:3000/schedule/create",
                { song: selectedSong._id, scheduledTime },
                { withCredentials: true }
            )
            toast.success("Song scheduled!")
            setShowSchedule(false)
            setScheduledTime("")
            setSelectedSong(null)
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to schedule")
        }
    }

    return (
        <div className='flex bg-black min-h-screen'>

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 bg-gradient-to-b from-black via-black to-red-950/30 p-8 overflow-y-auto">

                {/* Header */}
                <div className="flex items-end gap-8 mb-10">
                    <div className="w-48 h-48 bg-gradient-to-br from-red-800 to-red-950 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Heart size={80} className="text-white fill-white" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Playlist</p>
                        <h1 className="text-5xl font-black text-white mb-4">Liked Songs</h1>
                        <p className="text-gray-400">{songs.length} songs</p>
                    </div>
                </div>

                {/* Play All Button */}
                {songs.length > 0 && (
                    <button
                        onClick={() => playQueue(songs, 0)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold mb-8 transition shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Play size={20} />
                        Play All
                    </button>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty */}
                {!loading && songs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Heart size={48} className="text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No liked songs yet</p>
                        <p className="text-gray-600 text-sm mt-1">Like songs from the home page</p>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition"
                        >
                            Browse Songs
                        </button>
                    </div>
                )}

                {/* Songs List */}
                {!loading && songs.length > 0 && (
                    <div className="space-y-2 max-w-4xl">
                        {songs.map((song, index) => (
                            <div
                                key={song._id}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition group"
                            >
                                {/* Index / Play */}
                                <span className="text-gray-500 w-6 text-center group-hover:hidden">{index + 1}</span>
                                <Play
                                    size={16}
                                    className="text-green-500 hidden group-hover:block w-6 cursor-pointer"
                                    onClick={() => playQueue(songs, index)}
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

                                {/* Album */}
                                <p className="text-gray-400 text-sm hidden md:block">{song.album}</p>

                                {/* Duration */}
                                <span className="text-gray-400 text-sm">{song.duration}s</span>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                    {/* Schedule */}
                                    <button
                                        onClick={() => { setSelectedSong(song); setShowSchedule(true) }}
                                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-green-400 transition"
                                        title="Schedule"
                                    >
                                        <Clock size={18} />
                                    </button>

                                    {/* Unlike */}
                                    <button
                                        onClick={() => handleUnlike(song._id)}
                                        className="p-2 rounded-full hover:bg-white/10 transition"
                                        title="Unlike"
                                    >
                                        <Heart size={18} className="text-red-500 fill-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
    )
}

export default LikedSongs