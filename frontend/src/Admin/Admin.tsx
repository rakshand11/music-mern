import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Music, Upload, X, Pencil, Trash2 } from 'lucide-react'

type Song = {
    _id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    imageUrl: string;
    audioUrl: string;
}

const Admin = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [songs, setSongs] = useState<Song[]>([])
    const [editingSong, setEditingSong] = useState<Song | null>(null)
    const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload")

    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        album: "",
        duration: ""
    })

    useEffect(() => {
        const admin = JSON.parse(localStorage.getItem("admin") || "null")
        if (!admin) navigate("/admin/login")
    }, [])

    useEffect(() => {
        fetchSongs()
    }, [])

    const fetchSongs = async () => {
        try {
            const res = await axios.get("http://localhost:3000/song/get-all")
            setSongs(res.data.songs)
        } catch (error) {
            console.log(error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setAudioFile(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!audioFile) {
            toast.error("Audio file is required")
            return
        }
        if (!formData.title || !formData.artist || !formData.album || !formData.duration) {
            toast.error("All fields are required")
            return
        }
        try {
            setLoading(true)
            const data = new FormData()
            data.append("title", formData.title)
            data.append("artist", formData.artist)
            data.append("album", formData.album)
            data.append("duration", formData.duration)
            data.append("audio", audioFile)
            if (imageFile) data.append("image", imageFile)

            await axios.post("http://localhost:3000/song/create", data, { withCredentials: true })
            toast.success("Song uploaded successfully!")
            setFormData({ title: "", artist: "", album: "", duration: "" })
            setAudioFile(null)
            setImageFile(null)
            setImagePreview(null)
            fetchSongs()
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Upload failed")
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSong) return
        try {
            setLoading(true)
            const data = new FormData()
            data.append("title", formData.title)
            data.append("artist", formData.artist)
            data.append("album", formData.album)
            data.append("duration", formData.duration)
            if (imageFile) data.append("image", imageFile)  // ✅ append image if changed

            await axios.put(
                `http://localhost:3000/song/update/${editingSong._id}`,
                data,
                { withCredentials: true }
            )
            toast.success("Song updated!")
            setEditingSong(null)
            setFormData({ title: "", artist: "", album: "", duration: "" })
            setImageFile(null)
            setImagePreview(null)
            fetchSongs()
            setActiveTab("manage")
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Update failed")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (songId: string) => {
        if (!confirm("Are you sure you want to delete this song?")) return
        try {
            await axios.delete(
                `http://localhost:3000/song/delete/${songId}`,
                { withCredentials: true }
            )
            toast.success("Song deleted!")
            fetchSongs()
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Delete failed")
        }
    }

    const handleEdit = (song: Song) => {
        setEditingSong(song)
        setFormData({
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration.toString()
        })
        setImageFile(null)
        setImagePreview(null)
        setActiveTab("upload")
    }

    const handleCancelEdit = () => {
        setEditingSong(null)
        setFormData({ title: "", artist: "", album: "", duration: "" })
        setAudioFile(null)
        setImageFile(null)
        setImagePreview(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-10">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage Music Tune songs</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setActiveTab("upload"); handleCancelEdit() }}
                        className={`flex-1 py-3 rounded-xl font-semibold transition ${activeTab === "upload"
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        {editingSong ? "✏️ Edit Song" : "➕ Upload Song"}
                    </button>
                    <button
                        onClick={() => { setActiveTab("manage"); handleCancelEdit() }}
                        className={`flex-1 py-3 rounded-xl font-semibold transition ${activeTab === "manage"
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        🎵 Manage Songs ({songs.length})
                    </button>
                </div>

                {/* Upload / Edit Form */}
                {activeTab === "upload" && (
                    <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">

                        {/* Edit Banner */}
                        {editingSong && (
                            <div className="flex items-center gap-3 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <Pencil size={16} className="text-yellow-400" />
                                <p className="text-yellow-400 text-sm">Editing: <span className="font-bold">{editingSong.title}</span></p>
                                <button onClick={handleCancelEdit} className="ml-auto text-gray-400 hover:text-white">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={editingSong ? handleUpdate : handleSubmit} className="space-y-5">

                            {/* Cover Image */}
                            <div className="flex flex-col items-center">
                                {imagePreview ? (
                                    <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-lg">
                                        <img src={imagePreview} alt="cover" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setImagePreview(null) }}
                                            className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition"
                                        >
                                            <X size={16} className="text-white" />
                                        </button>
                                    </div>
                                ) : editingSong?.imageUrl ? (
                                    // ✅ show current image when editing with hover to change
                                    <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-lg group">
                                        <img src={editingSong.imageUrl} alt="cover" className="w-full h-full object-cover" />
                                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                            <Upload size={24} className="text-white mb-1" />
                                            <span className="text-white text-xs">Change Image</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="w-36 h-36 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-700/50 transition group">
                                        <Upload size={28} className="text-gray-500 group-hover:text-green-500 transition mb-2" />
                                        <span className="text-gray-500 group-hover:text-green-500 text-xs transition">Cover Image</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                                {editingSong && !imagePreview && (
                                    <p className="text-gray-500 text-xs mt-2">Hover image to change</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Title</label>
                                <input type="text" name="title" placeholder="Song title" value={formData.title} onChange={handleChange}
                                    className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
                            </div>

                            {/* Artist */}
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Artist</label>
                                <input type="text" name="artist" placeholder="Artist name" value={formData.artist} onChange={handleChange}
                                    className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
                            </div>

                            {/* Album */}
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Album</label>
                                <input type="text" name="album" placeholder="Album name" value={formData.album} onChange={handleChange}
                                    className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">Duration (seconds)</label>
                                <input type="text" name="duration" placeholder="e.g. 3:45 " value={formData.duration} onChange={handleChange}
                                    className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition" />
                            </div>

                            {/* Audio File — only for upload */}
                            {!editingSong && (
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">Audio File</label>
                                    <label className="w-full flex items-center gap-3 bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 cursor-pointer hover:border-green-500 transition group">
                                        <Upload size={18} className="text-gray-500 group-hover:text-green-500 transition" />
                                        <span className="text-gray-500 group-hover:text-green-500 text-sm transition">
                                            {audioFile ? audioFile.name : "Choose audio file (.mp3)"}
                                        </span>
                                        <input type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
                                    </label>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-700 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition"
                                >
                                    {loading
                                        ? editingSong ? "Updating..." : "Uploading..."
                                        : editingSong ? "Update Song" : "Upload Song"
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Manage Songs */}
                {activeTab === "manage" && (
                    <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                        {songs.length === 0 ? (
                            <p className="text-gray-400 text-center py-10">No songs yet</p>
                        ) : (
                            <div className="divide-y divide-gray-700">
                                {songs.map((song) => (
                                    <div key={song._id} className="flex items-center gap-4 p-4 hover:bg-gray-700/50 transition">
                                        <img
                                            src={song.imageUrl || "https://via.placeholder.com/50"}
                                            alt={song.title}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{song.title}</p>
                                            <p className="text-gray-400 text-sm truncate">{song.artist} • {song.album}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(song)}
                                                className="p-2 rounded-full hover:bg-yellow-500/20 text-yellow-400 transition"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(song._id)}
                                                className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Admin