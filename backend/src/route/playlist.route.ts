import { Router } from "express";
import { userMiddleware } from "../middleware/middleware.js";
import { addSongToPlaylist, createPlaylist, deletePlaylist, getPlaylist, getUserAllPlaylist, removeSongFromPlaylist, updatePlaylist } from "../controller/playlist.controller.js";
import { upload } from "../middleware/cloudinary.js";

export const playlistRoute = Router()

playlistRoute.post("/create", userMiddleware, upload.single("coverImage"), createPlaylist)
playlistRoute.get("/get-allplaylist", userMiddleware, getUserAllPlaylist)
playlistRoute.get("/get/:id", userMiddleware, getPlaylist)
playlistRoute.post("/add-song/:playlistId", userMiddleware, addSongToPlaylist)
playlistRoute.delete("/remove-song/:playlistId", userMiddleware, removeSongFromPlaylist)
playlistRoute.put("/update-playlist/:playlistId", userMiddleware, updatePlaylist)
playlistRoute.delete("/delete-playlist/:playlistId", userMiddleware, deletePlaylist)