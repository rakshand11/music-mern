import { io, Socket } from "socket.io-client"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://music-mern-1.onrender.com"

let socket: Socket | null = null

export const connectSocket = (userId: string): Socket => {
    if (socket && socket.connected) return socket


    if (socket) {
        socket.disconnect()
        socket = null
    }

    socket = io(BACKEND_URL, {
        query: { userId },
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
    })

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket?.id)
    })

    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected")
    })

    socket.on("connect_error", (err) => {
        console.log("⚠️ Socket connection error:", err.message)
    })

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}