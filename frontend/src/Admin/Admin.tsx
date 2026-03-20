import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Music, Upload, X } from 'lucide-react'

const Admin = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [audioFile, setAudioFile] = useState<File | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        album: "",
        duration: ""
    })
    useEffect(() => {
        const admin = JSON.parse(localStorage.getItem("admin") || "null")
        if (!admin) {
            navigate("/admin/login")
        }
    }, [])


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

            await axios.post(
                "http://localhost:3000/song/create",
                data,
                { withCredentials: true }
            )

            toast.success("Song uploaded successfully!")
            setFormData({ title: "", artist: "", album: "", duration: "" })
            setAudioFile(null)
            setImageFile(null)
            setImagePreview(null)

        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Upload failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Upload Song</h1>
                    <p className="text-gray-400 mt-1">Add a new song to Music Tune</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

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
                        ) : (
                            <label className="w-36 h-36 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-700/50 transition group">
                                <Upload size={28} className="text-gray-500 group-hover:text-green-500 transition mb-2" />
                                <span className="text-gray-500 group-hover:text-green-500 text-xs transition">Cover Image</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Song title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        />
                    </div>

                    {/* Artist */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Artist</label>
                        <input
                            type="text"
                            name="artist"
                            placeholder="Artist name"
                            value={formData.artist}
                            onChange={handleChange}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        />
                    </div>

                    {/* Album */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Album</label>
                        <input
                            type="text"
                            name="album"
                            placeholder="Album name"
                            value={formData.album}
                            onChange={handleChange}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="text-gray-400 text-sm mb-1 block">Duration (seconds)</label>
                        <input
                            type="number"
                            name="duration"
                            placeholder="e.g. 180"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        />
                    </div>

                    {/* Audio File */}
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
                            {loading ? "Uploading..." : "Upload Song"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Admin