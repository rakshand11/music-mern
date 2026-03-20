import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home } from "lucide-react";
import axios from "axios"
import toast from "react-hot-toast";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true })
            localStorage.removeItem("user");
            navigate("/signin");
        } catch (error) {
            toast.error("Cant logout")
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="w-full px-6 py-4 bg-white shadow-md flex items-center justify-between">

            {/* Left Section */}
            <div className="flex items-center space-x-5">
                <h1 className="text-xl font-bold text-green-600">
                    🎵 Music Tune
                </h1>

                <Link
                    to="/"
                    className="flex items-center space-x-1 text-gray-700 hover:text-green-600"
                >
                    <Home size={18} />
                    <span>Home</span>
                </Link>
            </div>

            {/* Center Section (Search) */}
            <div className="relative w-1/3">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search music..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>

            {/* Right Section */}
            <div
                className="flex items-center space-x-4 relative"
                ref={dropdownRef}
            >
                {user ? (
                    <>
                        {/* Avatar or Initial */}
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                onClick={() => setOpen(!open)}
                                className="w-10 h-10 rounded-full border cursor-pointer"
                            />
                        ) : (
                            <div
                                onClick={() => setOpen(!open)}
                                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold cursor-pointer"
                            >
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute right-0 top-14 bg-white shadow-lg rounded-lg w-40 py-2 z-50">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <Link
                            to="/signin"
                            className="text-gray-700 hover:text-green-600"
                        >
                            Sign In
                        </Link>

                        <Link
                            to="/signup"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;