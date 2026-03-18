import express, { type Request, type Response } from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import { userRouter } from "./route/user.route.js"
import { songRouter } from "./route/song.route.js"
import { playlistRoute } from "./route/playlist.route.js"
import { scheduleRouter } from "./route/schedule.route.js"
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
connectToDB()

app.use(express.json())
app.use(cookieParser())

app.use("/user", userRouter)
app.use("/song", songRouter)
app.use("/playlist", playlistRoute)
app.use("/schedule", scheduleRouter)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})