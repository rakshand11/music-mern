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

                const diff = Math.abs(scheduledTime.getTime() - now.getTime());
                const isSameMinute = diff < 60000;

                if (isSameMinute) {
                    const userId = (schedule.listener as any)._id.toString();


                    const user = await userModel.findById(userId)
                    const socketId = user?.socketId
                    const isSocketActive = socketId && io.sockets.sockets.has(socketId);

                    console.log(`🎵 Firing for user: ${userId} | Socket: ${socketId} | Active: ${isSocketActive}`);

                    if (isSocketActive && socketId) {
                        io.to(socketId).emit("play-song", { song: schedule.song });
                        console.log(`✅ Emitted play-song to socket: ${socketId}`);
                    } else {
                        console.log(`⏸️ User ${userId} is OFFLINE — skipping`);
                    }

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
