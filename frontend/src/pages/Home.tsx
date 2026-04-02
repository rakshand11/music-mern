import React, { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import { Play, Clock, X, Heart } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import toast from 'react-hot-toast'
import api from '../aiosInstance'

type Song = {
    _id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    imageUrl: string;
    audioUrl: string;
}

interface HomeProps { }

const Home: React.FC<HomeProps> = () => {
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [likedSongs, setLikedSongs] = useState<string[]>([])
    const [showSchedule, setShowSchedule] = useState<boolean>(false)
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)
    const [scheduledTime, setScheduledTime] = useState<string>('')
    const { playQueue } = usePlayer()

    const user = JSON.parse(localStorage.getItem("user") || "null") as { _id: string } | null

    const fetchSongs = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<{ songs: Song[] }>("/song/get-all")
            setSongs(res.data.songs)
        } catch (error) {
            console.error('Failed to fetch songs:', error)
            toast.error('Failed to load songs')
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchLikedSongs = useCallback(async () => {
        if (!user?._id) return
        try {
            const res = await api.get<{ songs: { _id: string }[] }>("/user/liked-songs")
            const ids = res.data.songs.map((s: { _id: string }) => s._id)
            setLikedSongs(ids)
        } catch (error) {
            console.error('Failed to fetch liked songs:', error)
        }
    }, [user?._id])

    useEffect(() => {
        fetchSongs()
    }, [fetchSongs])

    useEffect(() => {
        fetchLikedSongs()
    }, [fetchLikedSongs])

    const handleLike = useCallback(async (e: React.MouseEvent<HTMLDivElement>, songId: string) => {
        e.stopPropagation()
        if (!user?._id) {
            toast.error("Please sign in to like songs")
            return
        }
        try {
            const res = await api.post<{ liked: boolean }>(`/user/like/${songId}`, {})
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
    }, [user?._id])

    const handleSchedule = useCallback(async () => {
        if (!selectedSong || !scheduledTime) {
            toast.error("Please select a time")
            return
        }
        try {
            const istOffset = 5.5 * 60 * 60 * 1000
            const localDate = new Date(scheduledTime)
            const utcTime = new Date(localDate.getTime() - istOffset)

            console.log("📅 Input (local):", scheduledTime)
            console.log("📅 Sent to server (UTC):", utcTime.toISOString())
            console.log("📅 Diff from now (seconds):", Math.round((utcTime.getTime() - Date.now()) / 1000))

            if (utcTime.getTime() < Date.now()) {
                toast.error("Please select a future time")
                return
            }

            await api.post("/schedule/create", {
                song: selectedSong._id,
                scheduledTime: utcTime.toISOString()
            })
            toast.success("Song scheduled!")
            setShowSchedule(false)
            setScheduledTime("")
            setSelectedSong(null)
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Failed to schedule")
        }
    }, [selectedSong, scheduledTime])

    const handlePlaySong = useCallback((index: number) => {
        playQueue(songs, index)
    }, [playQueue, songs])

    const handleScheduleClick = useCallback((e: React.MouseEvent, song: Song) => {
        e.stopPropagation()
        setSelectedSong(song)
        setShowSchedule(true)
    }, [])


    const getMinTime = () => {
        const now = new Date()
        const istOffset = 5.5 * 60 * 60 * 1000
        const istNow = new Date(now.getTime() + istOffset)
        istNow.setSeconds(0, 0)
        return istNow.toISOString().slice(0, 16)
    }

    return (
        <div className='flex bg-gradient-to-br from-black via-gray-900 to-purple-900/20 min-h-screen overflow-hidden'>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full animate-ping [animation-delay:1s]" />
                <div className="absolute top-1/2 right-32 w-1 h-1 bg-pink-500 rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute bottom-32 left-1/2 w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:3s]" />
            </div>

            <Sidebar />

            <div className='flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto'>
                <div className='relative mb-6'>
                    <h1 className='text-2xl md:text-3xl lg:text-4xl font-black bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl text-white drop-shadow-2xl border border-white/10 mb-4 inline-block'>
                        🎵 All Songs
                    </h1>
                </div>

                {loading && (
                    <div className='flex items-center justify-center h-64'>
                        <div className='relative'>
                            <div className='w-16 h-16 border-4 border-green-500/50 border-t-green-500 rounded-full animate-spin shadow-2xl' />
                            <div className='absolute inset-0 w-16 h-16 border-2 border-purple-500/30 rounded-full animate-ping' />
                        </div>
                    </div>
                )}

                {!loading && songs.length === 0 && (
                    <p className='text-gray-400 text-center py-20 text-lg'>No songs available yet</p>
                )}

                {!loading && songs.length > 0 && (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4'>
                        {songs.map((song, index) => (
                            <SongCard
                                key={song._id}
                                song={song}
                                index={index}
                                isLiked={likedSongs.includes(song._id)}
                                onPlay={handlePlaySong}
                                onLike={handleLike}
                                onSchedule={handleScheduleClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showSchedule && selectedSong && (
                <ScheduleModal
                    song={selectedSong}
                    scheduledTime={scheduledTime}
                    minTime={getMinTime()}
                    onChangeTime={setScheduledTime}
                    onClose={() => {
                        setShowSchedule(false)
                        setScheduledTime("")
                        setSelectedSong(null)
                    }}
                    onSchedule={handleSchedule}
                />
            )}
        </div>
    )
}

interface SongCardProps {
    song: Song
    index: number
    isLiked: boolean
    onPlay: (index: number) => void
    onLike: (e: React.MouseEvent<HTMLDivElement>, songId: string) => void
    onSchedule: (e: React.MouseEvent, song: Song) => void
}

const SongCard: React.FC<SongCardProps> = React.memo(({
    song,
    index,
    isLiked,
    onPlay,
    onLike,
    onSchedule
}) => (
    <div
        className='group relative bg-gradient-to-br from-gray-900/50 to-gray-800/70 backdrop-blur-sm rounded-2xl p-3 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-pink-500/10 hover:shadow-2xl hover:shadow-purple-500/25 hover:shadow-lg border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden'
        onClick={() => onPlay(index)}
    >
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        <div className='relative z-10 mb-3'>
            <img
                src={song.imageUrl || 'https://via.placeholder.com/200?text=No+Image'}
                alt={song.title}
                className='w-full aspect-square object-cover rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-2xl'
            />

            <div
                className='absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-3 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 border-2 border-white/20 backdrop-blur-sm'
                onClick={(e) => {
                    e.stopPropagation()
                    onPlay(index)
                }}
            >
                <Play size={20} className='text-white drop-shadow-lg ml-0.5' />
            </div>

            <div
                className='absolute top-2 right-2 w-9 h-9 bg-black/70 hover:bg-purple-500/60 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-purple-400/50 hover:scale-110'
                onClick={(e) => onSchedule(e, song)}
                title="Schedule"
            >
                <Clock size={16} className='text-white drop-shadow-md' />
            </div>

            <div
                className='absolute top-2 left-2 w-9 h-9 bg-black/70 hover:bg-red-500/60 backdrop-blur-sm rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-red-400/50 hover:scale-110'
                onClick={(e) => onLike(e, song._id)}
                title="Like"
            >
                <Heart
                    size={16}
                    className={`drop-shadow-md transition-all ${isLiked
                        ? 'text-red-400 fill-red-400 scale-110'
                        : 'text-white hover:text-red-300'
                        }`}
                />
            </div>
        </div>

        <div className='relative z-10 flex flex-col space-y-1'>
            <p className='text-white font-bold text-sm truncate line-clamp-1 group-hover:text-purple-300 transition-colors drop-shadow-lg'>
                {song.title}
            </p>
            <p className='text-gray-300 text-xs truncate font-medium'>{song.artist}</p>
        </div>
    </div>
))

interface ScheduleModalProps {
    song: Song
    scheduledTime: string
    minTime: string          // ✅ added
    onChangeTime: (time: string) => void
    onClose: () => void
    onSchedule: () => void
}

const ScheduleModal: React.FC<ScheduleModalProps> = React.memo(({
    song,
    scheduledTime,
    minTime,
    onChangeTime,
    onClose,
    onSchedule
}) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                    ⏰ Schedule
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-2xl transition-all hover:scale-110"
                    aria-label="Close modal"
                >
                    <X size={24} className="text-gray-300 hover:text-white" />
                </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30">
                <div className="flex items-center gap-4">
                    <img
                        src={song.imageUrl || "https://via.placeholder.com/60?text=No+Image"}
                        alt={song.title}
                        className="w-16 h-16 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-white font-bold text-lg truncate">{song.title}</p>
                        <p className="text-gray-300 text-sm font-medium">{song.artist}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <label className="text-gray-300 text-sm font-medium mb-3 block">
                    Select Date & Time
                </label>
                <input
                    type="datetime-local"
                    value={scheduledTime}
                    min={minTime}          // ✅ prevents selecting past time
                    onChange={(e) => onChangeTime(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-600 hover:border-purple-400 focus:border-purple-500 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-lg backdrop-blur-sm"
                />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white hover:bg-gray-800/50 font-bold transition-all shadow-lg backdrop-blur-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={onSchedule}
                    className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-2xl hover:shadow-emerald-500/25 hover:scale-[1.02] transition-all duration-200 border border-emerald-500/50"
                >
                    Schedule Now
                </button>
            </div>
        </div>
    </div>
))

ScheduleModal.displayName = 'ScheduleModal'
SongCard.displayName = 'SongCard'

export default Home
