import type { Request, Response } from "express";
import { scheduleModel } from "../model/schedule.model.js";

export const createSchedule = async (req: Request, res: Response) => {
    try {
        const { song, scheduledTime } = req.body
        const schedule = await scheduleModel.create({ song, scheduledTime, listener: req.user._id })
        res.status(201).json({ msg: "Schedule created successfully", schedule })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getUserSchedule = async (req: Request, res: Response) => {
    try {
        const schedules = await scheduleModel.find({ listener: req.user._id }).populate("song")
        res.status(200).json({ msg: "Your schedules", schedules })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const updateSchedules = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params
        const { song, scheduledTime } = req.body
        const schedule = await scheduleModel.findByIdAndUpdate(scheduleId, { song, scheduledTime }, { returnDocument: "after" })
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
        const schedule = await scheduleModel.findByIdAndDelete(scheduleId)
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
        const schedule = await scheduleModel.findByIdAndUpdate(scheduleId, [{ $set: { isActive: { $not: "$isActive" } } }], { new: true }) //Aggregation Pipeline
        if (!schedule) {
            res.status(404).json({ msg: "Schedule not found" })
            return
        }
        res.status(200).json({
            msg: schedule.isActive ? "Schedule activated" : "Schedule deactivated",
            schedule
        })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}