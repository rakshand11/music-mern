import { Router } from "express";
import { createSong, deleteSong, getAllSongs, getSongById, searchSong, updateSong } from "../controller/song.controller.js";
import { adminOnly } from "../middleware/middleware.js";
import { upload } from "../middleware/cloudinary.js";

export const songRouter = Router()

songRouter.post("/create", adminOnly,
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ])
    , createSong)
songRouter.get("/get-all", getAllSongs)
songRouter.get("/get/:id", getSongById)
songRouter.put("/update/:id", upload.single("image"), adminOnly, updateSong)
songRouter.delete("/delete/:id", adminOnly, upload.single("image"), deleteSong)
songRouter.get("/search", searchSong)