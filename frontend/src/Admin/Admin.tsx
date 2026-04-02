import React, { useEffect, useState } from 'react'
import api from '../aiosInstance'
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
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || user.role !== "admin") navigate("/signin");
    }, [])

    useEffect(() => {
        fetchSongs()
    }, [])

    const fetchSongs = async () => {
        try {
            const res = await api.get("/song/get-all")
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

            await api.post("/song/create", data)
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
            if (imageFile) data.append("image", imageFile)

            await api.put(`/song/update/${editingSong._id}`, data)
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
            await api.delete(`/song/delete/${songId}`)
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

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Manage Music Tune songs</p>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setActiveTab("upload"); handleCancelEdit() }}
                        className={`flex-1 py-3 rounded-xl font-semibold transition ${activeTab === "upload"
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        {editingSong ? "Edit Song" : "Upload Song"}
                    </button>
                    <button
                        onClick={() => { setActiveTab("manage"); handleCancelEdit() }}
                        className={`flex-1 py-3 rounded-xl font-semibold transition ${activeTab === "manage"
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                    >
                        Manage Songs ({songs.length})
                    </button>
                </div>

                {activeTab === "upload" && (
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">

                        {editingSong && (
                            <div className="flex items-center gap-3 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <Pencil size={16} className="text-yellow-400" />
                                <p className="text-yellow-400 text-sm">Editing: {editingSong.title}</p>
                                <button onClick={handleCancelEdit} className="ml-auto text-gray-400">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={editingSong ? handleUpdate : handleSubmit} className="space-y-5">

                            <div className="flex flex-col items-center">
                                {imagePreview ? (
                                    <div className="relative w-36 h-36 rounded-xl overflow-hidden">
                                        <img src={imagePreview} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                                            className="absolute top-2 right-2 bg-black p-1 rounded-full">
                                            <X size={16} className="text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-36 h-36 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer">
                                        <Upload size={24} className="text-gray-400" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            <input name="title" placeholder="Title" value={formData.title} onChange={handleChange}
                                className="w-full p-3 rounded bg-gray-700 text-white" />
                            <input name="artist" placeholder="Artist" value={formData.artist} onChange={handleChange}
                                className="w-full p-3 rounded bg-gray-700 text-white" />
                            <input name="album" placeholder="Album" value={formData.album} onChange={handleChange}
                                className="w-full p-3 rounded bg-gray-700 text-white" />
                            <input name="duration" placeholder="Duration" value={formData.duration} onChange={handleChange}
                                className="w-full p-3 rounded bg-gray-700 text-white" />

                            {!editingSong && (
                                <input type="file" accept="audio/*" onChange={handleAudioChange}
                                    className="w-full text-white" />
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={() => navigate("/")}
                                    className="flex-1 p-3 border border-gray-600 text-gray-400 rounded">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 p-3 bg-green-500 text-white rounded">
                                    {loading ? "Loading..." : editingSong ? "Update" : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === "manage" && (
                    <div className="bg-gray-800 rounded-2xl border border-gray-700">
                        {songs.map(song => (
                            <div key={song._id} className="flex items-center gap-4 p-4 border-b border-gray-700">
                                <img src={song.imageUrl} className="w-12 h-12 rounded" />
                                <div className="flex-1">
                                    <p className="text-white">{song.title}</p>
                                    <p className="text-gray-400 text-sm">{song.artist}</p>
                                </div>
                                <button onClick={() => handleEdit(song)}><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(song._id)}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Admin