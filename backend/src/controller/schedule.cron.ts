import cron from "node-cron";
import { scheduleModel } from "../model/schedule.model.js";
import { io, userSocketMap } from "../index.js";

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

                // ✅ check within same minute
                const isSameMinute =
                    scheduledTime.getFullYear() === now.getFullYear() &&
                    scheduledTime.getMonth() === now.getMonth() &&
                    scheduledTime.getDate() === now.getDate() &&
                    scheduledTime.getHours() === now.getHours() &&
                    scheduledTime.getMinutes() === now.getMinutes();

                if (isSameMinute) {
                    const userId = (schedule.listener as any)._id.toString();
                    const socketId = userSocketMap.get(userId);
                    const isSocketActive = socketId && io.sockets.sockets.has(socketId);

                    console.log(`🎵 Firing for user: ${userId} | Socket: ${socketId} | Active: ${isSocketActive}`);

                    if (isSocketActive) {
                        io.to(socketId).emit("play-song", { song: schedule.song });
                        console.log(`✅ Emitted play-song to socket: ${socketId}`);
                    } else {
                        console.log(`⏸️ User ${userId} is OFFLINE — skipping`);
                    }

                    // ✅ deactivate after firing
                    schedule.isActive = false;
                    await schedule.save();
                }
            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    }, {
        timezone: "Asia/Kolkata"
    });

    console.log("✅ Schedule cron started (Asia/Kolkata)");
};
