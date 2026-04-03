import type { Request, Response } from "express";
import { scheduleModel } from "../model/schedule.model.js";

export const createSchedule = async (req: Request, res: Response) => {
    try {
        const { song, scheduledTime } = req.body
        console.log("📅 Saving scheduledTime:", scheduledTime)
        console.log("🕐 Server UTC now:", new Date().toISOString())
        console.log("⏱️ Diff (seconds):", Math.round((new Date(scheduledTime).getTime() - Date.now()) / 1000))
        const schedule = await scheduleModel.create({
            song,
            scheduledTime,
            listener: req.user._id
        })
        res.status(201).json({ msg: "Schedule created successfully", schedule })
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}
export const getUserSchedule = async (req: Request, res: Response) => {
    try {
        const schedules = await scheduleModel
            .find({ listener: req.user._id })
            .populate("song")
            .sort({ scheduledTime: 1 })
        res.status(200).json({ msg: "Your schedules", schedules })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const updateSchedules = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params
        const updates: Record<string, any> = {}

        if (req.body.song) updates.song = req.body.song
        if (req.body.scheduledTime) updates.scheduledTime = req.body.scheduledTime


        const schedule = await scheduleModel.findOneAndUpdate(
            { _id: scheduleId, listener: req.user._id },
            updates,
            { returnDocument: "after", new: true }
        ).populate("song")

        if (!schedule) {
            res.status(404).json({ msg: "Schedule not found" })
            return
        }

        res.status(200).json({ msg: "Schedule updated successfully", schedule })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const deleteSchedule = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params
        const schedule = await scheduleModel.findOneAndDelete({
            _id: scheduleId,
            listener: req.user._id
        })
        if (!schedule) {
            res.status(404).json({ msg: "Schedule not found" })
            return
        }
        res.status(200).json({ msg: "Schedule deleted successfully" })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const toggleSchedule = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params
        const schedule = await scheduleModel.findOne({
            _id: scheduleId,
            listener: req.user._id
        })
        if (!schedule) {
            res.status(404).json({ msg: "Schedule not found" })
            return
        }

        if (!schedule.isActive && new Date(schedule.scheduledTime) < new Date()) {
            res.status(400).json({
                msg: "Cannot activate a past schedule. Please reschedule it first."
            })
            return
        }

        schedule.isActive = !schedule.isActive
        await schedule.save()

        res.status(200).json({
            msg: schedule.isActive ? "Schedule activated" : "Schedule deactivated",
            schedule
        })
        return
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ msg: "Internal server error" })
    }
}

