import { io, Socket } from "socket.io-client"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

let socket: Socket | null = null

export const connectSocket = (userId: string): Socket => {
    if (socket && socket.connected) return socket

    socket = io(BACKEND_URL, {
        query: { userId },
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
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