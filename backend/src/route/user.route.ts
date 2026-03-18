import { Router } from "express";
import { adminLogin, loginUser, logoutUser, registerUser } from "../controller/user.controller.js";

export const userRouter = Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/logout", logoutUser)
userRouter.post("/admin/login", adminLogin)