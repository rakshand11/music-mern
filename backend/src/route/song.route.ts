import { Router } from "express";
import { createSong, deleteSong, getAllSongs, getSongById, searchSong, updateSong } from "../controller/song.controller.js";
import { adminOnly } from "../middleware/middleware.js";
import { upload } from "../middleware/cloudinary.js";

export const songRouter = Router()

// ✅ adminOnly first, then upload (so unauth requests are rejected before file processing)
songRouter.post("/create", adminOnly,
    upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ]),
    createSong
)

songRouter.get("/get-all", getAllSongs)
songRouter.get("/get/:id", getSongById)
songRouter.get("/search", searchSong)

// ✅ adminOnly before upload on update
songRouter.put("/update/:id", adminOnly, upload.single("image"), updateSong)

// ✅ removed upload.single("image") from delete — delete doesn't need file upload
songRouter.delete("/delete/:id", adminOnly, deleteSong)