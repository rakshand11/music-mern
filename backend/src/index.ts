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
dotenv.config()

const app = express()
const PORT = process.env.PORT

const connectToDB = async () => {
    const mongoURI = process.env.MONGO_URI || ""
    try {
        await mongoose.connect(mongoURI)
        console.log(`successfully connected to db`)
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
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.get(("/"), (req: Request, res: Response) => {
    res.send("hello")
})
app.use("/user", userRouter)
app.use("/song", songRouter)
app.use("/playlist", playlistRoute)
app.use("/schedule", scheduleRouter)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})