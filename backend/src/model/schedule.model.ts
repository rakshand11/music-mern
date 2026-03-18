import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema({
    listener: { type: Schema.Types.ObjectId, ref: "user", required: true },
    song: { type: Schema.Types.ObjectId, ref: "song", required: true },
    isActive: { type: Boolean, default: true },
    scheduledTime: { type: Date, required: true }
}, { timestamps: true })

export const scheduleModel = mongoose.model("schedule", scheduleSchema)