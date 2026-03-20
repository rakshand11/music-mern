import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import MusicBackground from "../components/MusicAnimation";

const Signin: React.FC = () => {
    const navigate = useNavigate();
    const [setUser] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            toast.error("password should not be less than 6 characters");
            return;
        }
        if (formData.password.length > 20) {
            toast.error("Password should not be more than 20 characters");
            return;
        }
        if (!formData.email || !formData.password) {
            toast.error("All fields should be filled");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post("http://localhost:3000/user/login", {
                email: formData.email,
                password: formData.password
            }, { withCredentials: true });
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            toast.success("Logged in successfully");
            navigate("/");
        } catch (error: any) {
            console.log("Error:", error.response?.data)
            toast.error(error.response?.data?.msg || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-50 via-lime-100 to-emerald-50 py-20 px-4">
            {/* 🎵 Background Animation */}
            <MusicBackground />

            {/* Welcome Header */}
            <div className="relative z-20 text-center mb-12 w-full max-w-2xl animate-fadeIn">
                <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-700 bg-clip-text text-transparent mb-6 drop-shadow-2xl leading-tight">
                    Welcome Back to
                    <span className="block text-4xl md:text-5xl bg-gradient-to-r from-lime-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-xl">
                        Music Tune
                    </span>
                </h1>

            </div>

            {/* Form container */}
            <div className="relative z-10 w-full max-w-lg p-10 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-white/60 animate-pulse-slow">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-gray-600 text-lg">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-gray-800 transition-all duration-300 pointer-events-none" size={20} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full h-14 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-lg text-gray-800 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 focus:outline-none transition-all duration-500 shadow-lg hover:shadow-xl group-hover:border-emerald-300 relative z-10"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-gray-800 transition-all duration-300 pointer-events-none" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password (6-20 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full h-14 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl py-4 pl-14 pr-14 text-lg text-gray-800 placeholder-gray-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-100/60 focus:outline-none transition-all duration-500 shadow-lg hover:shadow-xl group-hover:border-lime-300 relative z-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 hover:bg-white/50 p-2 rounded-full transition-all duration-300 z-20"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} className="cursor-pointer" />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full h-14 bg-gradient-to-r from-lime-500 via-lime-600 to-emerald-500 hover:from-lime-600 hover:via-lime-700 hover:to-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden relative z-10"
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm mt-8 text-gray-700 pt-6 border-t border-gray-200">
                    Don't have an account?{" "}
                    <Link to="/signup" className="font-bold text-lime-600 hover:text-lime-700 hover:underline transition-all duration-300">
                        Sign Up
                    </Link>
                </p>
            </div>


        </div>
    );
};

export default Signin;
