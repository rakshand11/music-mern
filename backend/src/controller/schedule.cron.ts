import cron from "node-cron";

export const startScheduleCron = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            
            const dueSchedules = await scheduleModel
                .find({ isActive: true })
                .populate("song")
                .populate("listener");

            for (const schedule of dueSchedules) {
                const scheduledTime = new Date(schedule.scheduledTime);

                const isSameMinute =
                    scheduledTime.getFullYear() === now.getFullYear() &&
                    scheduledTime.getMonth() === now.getMonth() &&
                    scheduledTime.getDate() === now.getDate() &&
                    scheduledTime.getHours() === now.getHours() &&
                    scheduledTime.getMinutes() === now.getMinutes();

                if (isSameMinute) {
                    const userId = (schedule.listener as any)._id.toString();
                    const socketId = userSocketMap.get(userId);

                    console.log(`🎵 Firing schedule for user: ${userId}`);

                    if (socketId) {
                        io.to(socketId).emit("play-song", { song: schedule.song });
                        console.log(`✅ Emitted play-song to socket: ${socketId}`);
                    } else {
                        console.log(`⚠️ User ${userId} is not connected`);
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

    console.log("✅ Schedule cron job started (Asia/Kolkata timezone)");
};