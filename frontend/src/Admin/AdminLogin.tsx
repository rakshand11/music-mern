import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import api from "../aiosInstance";
import { toast } from "react-hot-toast";
import MusicBackground from "../components/MusicAnimation";

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("All fields are required");
            return;
        }
        try {
            setLoading(true);
            const res = await api.post("/user/admin/login", formData);
            localStorage.setItem("admin", JSON.stringify(res.data.admin));
            toast.success("Welcome Admin!");
            navigate("/admin");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 via-lime-100 to-emerald-50 py-40 px-4">
            <MusicBackground />

            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-700 bg-clip-text text-transparent mb-6">
                    Music Tune
                </h1>

                <div className="relative z-10 w-full max-w-lg p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-white/60">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <Shield size={32} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-1 w-full">
                        Admin Login
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">Access the admin dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Admin Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full h-14 bg-white/70 border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-lg text-gray-800 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Admin Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full h-14 bg-white/70 border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-14 text-lg text-gray-800 focus:border-lime-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-lime-500 to-emerald-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center"
                        >
                            {loading ? "Logging in..." : "Login as Admin"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;