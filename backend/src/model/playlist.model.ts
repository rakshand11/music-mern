import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "user", required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: "song" }],
    coverImage: { type: String, default: "" }
}, { timestamps: true })

export const playlistModel = mongoose.model("playlist", playlistSchema)