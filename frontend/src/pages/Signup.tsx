import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "../aiosInstance";
import { toast } from "react-hot-toast";
import MusicBackground from "../components/MusicAnimation";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        avatar: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password) {
            toast.error("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password should not be less than 6 characters");
            return;
        }

        if (formData.password.length > 20) {
            toast.error("Password should not be more than 20 characters");
            return;
        }

        try {
            setLoading(true);

            await api.post("/user/register", formData);

            const login = await api.post("/user/login", {
                email: formData.email,
                password: formData.password,
            });

            setUser(login.data.user);
            localStorage.removeItem("recentSongs")
            localStorage.setItem("user", JSON.stringify(login.data.user));

            toast.success("Registered successfully");
            navigate("/");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Something went wrong");
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 w-full">
                        Create Account
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Join us and feel the rhythm of life.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none" size={20} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full h-14 bg-white/70 border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-lg text-gray-800 focus:border-lime-400 focus:ring-4 focus:ring-lime-100/60 focus:outline-none transition"
                            />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full h-14 bg-white/70 border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-lg text-gray-800 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 focus:outline-none transition"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password (6-20 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full h-14 bg-white/70 border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-14 text-lg text-gray-800 focus:border-lime-400 focus:ring-4 focus:ring-lime-100/60 focus:outline-none transition"
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
                            className="w-full h-14 bg-gradient-to-r from-lime-500 to-emerald-500 disabled:opacity-60 text-white rounded-2xl font-bold text-xl flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6 text-gray-700 pt-6 border-t border-gray-200">
                        Already have an account?{" "}
                        <Link to="/signin" className="font-bold text-lime-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;