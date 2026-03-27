import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket | null => socket

export const connectSocket = (userId: string): Socket => {
    if (socket && socket.connected) return socket

    socket = io("http://localhost:3000", {
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