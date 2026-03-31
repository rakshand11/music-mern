

import cron from "node-cron";
import { scheduleModel } from "./../model/schedule.model.js";


type SongType = {
    _id: string;
    title: string;
};

export async function loadAllSchedules() {
    const schedules = await scheduleModel
        .find({ isActive: true })
        .populate<{ song: SongType }>("song");

    schedules.forEach((schedule) => {
        const song = schedule.song;
        const when = new Date(schedule.scheduledTime);
        const second = when.getSeconds();
        const minute = when.getMinutes();
        const hour = when.getHours();
        const dayOfMonth = when.getDate();
        const month = when.getMonth() + 1;

        const cronTime = `${second} ${minute} ${hour} ${dayOfMonth} ${month} *`;

        cron.schedule(cronTime, () => {
            console.log("🎵 Scheduled song trigger:", schedule.song.title);
        });
    });
}