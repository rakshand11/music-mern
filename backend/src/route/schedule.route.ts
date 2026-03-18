import { Router } from "express";
import { userMiddleware } from "../middleware/middleware.js";
import { createSchedule, deleteSchedule, getUserSchedule, toggleSchedule, updateSchedules } from "../controller/schedule.controller.js";

export const scheduleRouter = Router()

scheduleRouter.post("/create", userMiddleware, createSchedule)
scheduleRouter.get("/get-schedule", userMiddleware, getUserSchedule)
scheduleRouter.put("/update-schedule/:scheduleId", userMiddleware, updateSchedules)
scheduleRouter.delete("/delete-schedule/:scheduleId", userMiddleware, deleteSchedule)
scheduleRouter.patch("/toggle/:scheduleId", userMiddleware, toggleSchedule)