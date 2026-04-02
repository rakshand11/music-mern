import express, { type Request, type Response } from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import { userRouter } from "./route/user.route.js"
import { songRouter } from "./route/song.route.js"
import { playlistRoute } from "./route/playlist.route.js"
import { scheduleRouter } from "./route/schedule.route.js"
import cors from "cors"
import { cloudinary } from "./middleware/cloudinary.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { startScheduleCron } from "./controller/schedule.cron.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, "http://localhost:5173"]
    : ["http://localhost:5173"]

const httpServer = createServer(app)

export const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    },

    pingTimeout: 60000,
    pingInterval: 25000,
})

export const userSocketMap = new Map<string, string>()

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string

    if (userId) {

        userSocketMap.set(userId, socket.id)
        console.log(`🟢 User connected: ${userId} → socket: ${socket.id}`)
    }

    socket.on("disconnect", () => {
        if (userId) {

            if (userSocketMap.get(userId) === socket.id) {
                userSocketMap.delete(userId)
            }
            console.log(`🔴 User disconnected: ${userId}`)
        }
    })
})

const connectToDB = async () => {
    const mongoURI = process.env.MONGO_URI || ""
    try {
        await mongoose.connect(mongoURI)
        console.log(`successfully connected to db`)
        startScheduleCron()
    } catch (error) {
        console.log("not connected to db")
    }
}

const connectCloudinary = async () => {
    try {
        await cloudinary.api.ping()
        console.log("Cloudinary connected")
    } catch (error) {
        console.error("Cloudinary connection failed")
    }
}

connectToDB()
connectCloudinary()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

if (process.env.NODE_ENV === "production") {
    setInterval(() => {
        fetch(`${process.env.BACKEND_URL}/`)
            .then(() => console.log("🏓 Keep-alive ping"))
            .catch(() => console.log("⚠️ Keep-alive failed"))
    }, 10 * 60 * 1000)
}

app.get("/", (req: Request, res: Response) => {
    res.send("hello")
})

app.use("/user", userRouter)
app.use("/song", songRouter)
app.use("/playlist", playlistRoute)
app.use("/schedule", scheduleRouter)

httpServer.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})