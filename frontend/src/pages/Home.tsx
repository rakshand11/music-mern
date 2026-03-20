import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import axios from 'axios'
import { Play, Clock, X, Heart } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import toast from 'react-hot-toast'

type Song = {
    _id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    imageUrl: string;
    audioUrl: string;
}

const Home = () => {
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const [likedSongs, setLikedSongs] = useState<string[]>([]) // ✅ store liked song IDs
    const { playQueue } = usePlayer()

    // schedule states
    const [showSchedule, setShowSchedule] = useState(false)
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [scheduledTime, setScheduledTime] = useState("")

    const user = JSON.parse(localStorage.getItem("user") || "null")

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const res = await axios.get("http://localhost:3000/song/get-all")
                setSongs(res.data.songs)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchSongs()
    }, [])

    // ✅ fetch liked songs
    useEffect(() => {
        const fetchLikedSongs = async () => {
            if (!user) return
            try {
                const res = await axios.get(
                    "http://localhost:3000/user/liked-songs",
                    { withCredentials: true }
                )
                const ids = res.data.songs.map((s: any) => s._id)
                setLikedSongs(ids)
            } catch (error) {
                console.log(error)
            }
        }
        fetchLikedSongs()
    }, [])

    // ✅ toggle like
    const handleLike = async (e: React.MouseEvent, songId: string) => {
        e.stopPropagation()
        if (!user) {
            toast.error("Please sign in to like songs")
            return
        }
        try {
            const res = await axios.post(
                `http://localhost:3000/user/like/${songId}`,
                {},
                { withCredentials: true }
            )
            if (res.data.liked) {
                setLikedSongs(prev => [...prev, songId])
                toast.success("Added to liked songs ❤️")
            } else {
                setLikedSongs(prev => prev.filter(id => id !== songId))
                toast.success("Removed from liked songs")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to like song")
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
            <div className='flex-1 p-8 overflow-y-auto'>

                {/* Header */}
                <h1 className='text-3xl font-bold text-white mb-8'>
                    🎵 All Songs
                </h1>

                {/* Loading */}
                {loading && (
                    <div className='flex items-center justify-center h-64'>
                        <div className='w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin' />
                    </div>
                )}

                {/* Empty */}
                {!loading && songs.length === 0 && (
                    <p className='text-gray-500 text-center py-20'>No songs available</p>
                )}

                {/* Songs Grid */}
                {!loading && songs.length > 0 && (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                        {songs.map((song, index) => (
                            <div
                                key={song._id}
                                className='bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition cursor-pointer group'
                            >
                                {/* Cover Image */}
                                <div className='relative mb-4'>
                                    <img
                                        src={song.imageUrl || 'https://via.placeholder.com/200'}
                                        alt={song.title}
                                        className='w-full aspect-square object-cover rounded-lg'
                                        onClick={() => playQueue(songs, index)}
                                    />

                                    {/* Play button */}
                                    <div
                                        onClick={() => playQueue(songs, index)}
                                        className='absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg'
                                    >
                                        <Play size={18} className='text-white ml-0.5' />
                                    </div>

                                    {/* Schedule button */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedSong(song)
                                            setShowSchedule(true)
                                        }}
                                        className='absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'
                                        title="Schedule"
                                    >
                                        <Clock size={14} className='text-white' />
                                    </div>

                                    {/* ✅ Like button */}
                                    <div
                                        onClick={(e) => handleLike(e, song._id)}
                                        className='absolute top-2 left-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'
                                        title="Like"
                                    >
                                        <Heart
                                            size={14}
                                            className={likedSongs.includes(song._id)
                                                ? 'text-red-500 fill-red-500'
                                                : 'text-white'
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Song Info */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1 min-w-0'>
                                        <p
                                            onClick={() => playQueue(songs, index)}
                                            className='text-white font-semibold text-sm truncate'
                                        >
                                            {song.title}
                                        </p>
                                        <p className='text-gray-400 text-xs truncate mt-1'>{song.artist}</p>
                                    </div>
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

export default Home