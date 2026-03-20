import mongoose, { Schema } from "mongoose";

const songSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: String, required: true },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, default: "" }
}, { timestamps: true })

export const songModel = mongoose.model("song", songSchema)