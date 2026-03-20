import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Music, Upload, X } from "lucide-react";
import toast from "react-hot-toast";

const CreatePlaylist = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setCoverImage(null);
        setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            toast.error("Playlist name is required");
            return;
        }
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("name", name);
            if (coverImage) formData.append("coverImage", coverImage);

            await axios.post(
                "http://localhost:3000/playlist/create",
                formData,
                { withCredentials: true }
            );

            toast.success("Playlist created!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Playlist</h1>
                    <p className="text-gray-400 mt-1">Add a name and cover image</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Cover Image Upload */}
                    <div className="flex flex-col items-center">
                        {preview ? (
                            <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg">
                                <img src={preview} alt="cover" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition"
                                >
                                    <X size={16} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-700/50 transition-all duration-300 group">
                                <Upload size={32} className="text-gray-500 group-hover:text-green-500 transition mb-2" />
                                <span className="text-gray-500 group-hover:text-green-500 text-sm transition">Upload Cover</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Playlist Name */}
                    <div>
                        <label className="text-gray-400 text-sm mb-2 block">Playlist Name</label>
                        <input
                            type="text"
                            placeholder="My awesome playlist"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-700 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition"
                        >
                            {loading ? "Creating..." : "Create Playlist"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylist;