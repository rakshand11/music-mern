import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema(
    {
        listener: { type: Schema.Types.ObjectId, ref: "user", required: true },
        song: { type: Schema.Types.ObjectId, ref: "song", required: true },
        isActive: { type: Boolean, default: true },
        scheduledTime: { type: Date, required: true },
    },
    { timestamps: true },
);

scheduleSchema.pre('save', function () {
    if (!this.isActive) {
        console.log("⚠️ isActive set to false — stack:", new Error().stack)
    }
})

scheduleSchema.pre('findOneAndUpdate', function () {
    const update = this.getUpdate() as any
    if (update && update.isActive === false) {
        console.log("⚠️ findOneAndUpdate setting isActive=false — stack:", new Error().stack)
    }
})

scheduleSchema.pre('updateOne', function () {
    const update = this.getUpdate() as any
    if (update && update.isActive === false) {
        console.log("⚠️ updateOne setting isActive=false — stack:", new Error().stack)
    }
})

export const scheduleModel = mongoose.model("schedule", scheduleSchema);