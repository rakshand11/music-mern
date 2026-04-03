import cron from "node-cron";
import { scheduleModel } from "../model/schedule.model.js";
import { userModel } from "../model/user.model.js";
import { io } from "../index.js";

export const startScheduleCron = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            console.log(`🕐 Cron check: ${now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);

            const dueSchedules = await scheduleModel
                .find({ isActive: true })
                .populate("song")
                .populate("listener");

            console.log(`📊 Active schedules found: ${dueSchedules.length}`);

            for (const schedule of dueSchedules) {
                const scheduledTime = new Date(schedule.scheduledTime);

                // ✅ fire if within 5s before or 60s after scheduled time
                const diff = now.getTime() - scheduledTime.getTime();
                const shouldFire = diff >= 0 && diff < 60000;
                console.log(`🔍 Checking: ${scheduledTime.toISOString()} | diff: ${Math.round(diff / 1000)}s | match: ${shouldFire}`)

                if (shouldFire) {
                    const userId = (schedule.listener as any)._id.toString();

                    console.log(`⏰ Scheduled time (UTC): ${scheduledTime.toISOString()}`)
                    console.log(`⏰ Now (UTC): ${now.toISOString()}`)
                    console.log(`⏰ Diff in seconds: ${Math.round(diff / 1000)}s`)

                    const user = await userModel.findById(userId)
                    const socketId = user?.socketId

                    console.log(`🔌 Total connected sockets: ${io.sockets.sockets.size}`)
                    console.log(`🎵 Firing for user: ${userId} | Socket: ${socketId}`);

                    if (socketId) {
                        io.to(socketId).emit("play-song", { song: schedule.song });
                        console.log(`✅ Emitted play-song to socket: ${socketId}`);
                    } else {
                        console.log(`⏸️ User ${userId} is OFFLINE — skipping`);

                    }

                }
            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });

};