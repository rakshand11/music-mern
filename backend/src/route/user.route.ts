import { Router } from "express";
import { getLikedSongs, loginAdmin, loginUser, logoutUser, registerUser, toggleLikeSong, updateUser } from "../controller/user.controller.js";
import { userMiddleware } from "../middleware/middleware.js";
import { upload } from "../middleware/cloudinary.js";

export const userRouter = Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/logout", logoutUser)
userRouter.post("/like/:songId", userMiddleware, toggleLikeSong)
userRouter.get("/liked-songs", userMiddleware, getLikedSongs)
userRouter.put("/update", userMiddleware, upload.single("avatar"), updateUser)
userRouter.post("/admin/login", loginAdmin)