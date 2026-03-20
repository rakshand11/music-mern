import type { Request, Response } from "express";
import { songModel } from "../model/song.model.js";

export const createSong = async (req: Request, res: Response) => {
    try {
        const { title, artist, album, duration } = req.body
        const files = req.files as { [fieldname: string]: Express.Multer.File[] }
        const audioUrl = files?.audio?.[0]?.path
        const imageUrl = files?.image?.[0]?.path
        if (!title || !artist || !album || !duration) {
            res.status(400).json({ msg: "All fields should be filled" })
            return
        }
        if (!audioUrl) {
            res.status(400).json({ msg: "Audio file is required" })
            return
        }
        const song = await songModel.create({ title, artist, album, duration, audioUrl, imageUrl: imageUrl || "" })
        res.status(201).json({ msg: "Song created successfully", song })
        return
    } catch (error) {
        console.log(error, "error")
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getAllSongs = async (req: Request, res: Response) => {
    try {
        const songs = await songModel.find()
        res.status(200).json({ msg: "All songs", songs })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getSongById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const song = await songModel.findById(id)
        if (!song) {
            res.status(404).json({ msg: "Song not found" })
            return
        }
        res.status(200).json({ msg: "Song found", song })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const updateSong = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { title, artist, album, duration } = req.body
        const song = await songModel.findByIdAndUpdate(id, { title, artist, album, duration }, { returnDocument: "after" })
        if (!song) {
            res.status(404).json({ msg: "Song not found" })
            return
        }
        res.status(200).json({ msg: "Updated successfully", song })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const deleteSong = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const song = await songModel.findByIdAndDelete(id)
        if (!song) {
            res.status(404).json({ msg: "Song not found" })
            return
        }
        res.status(200).json({ msg: "Song deleted successfully" })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const searchSong = async (req: Request, res: Response) => {
    try {
        const { query } = req.query
        const songs = await songModel.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { artist: { $regex: query, $options: "i" } }
            ]
        } as any)
        res.status(200).json({ msg: "Search results", songs })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}