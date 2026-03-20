import type { Request, Response } from "express";
import { playlistModel } from "../model/playlist.model.js";

export const createPlaylist = async (req: Request, res: Response) => {
    try {
        const { name } = req.body
        const coverImage = req.file?.path
        if (!name) {
            res.status(400).json({ msg: "Playlist name is required" })
            return
        }
        const playlist = await playlistModel.create({ name, creator: req.user._id, coverImage: coverImage || "" })
        res.status(201).json({ msg: "Playlist created successfully", playlist })
        return
    } catch (error) {
        console.log(error, "error")
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getUserAllPlaylist = async (req: Request, res: Response) => {
    try {
        const { id } = req.user
        if (!id) {
            res.status(404).json({ msg: "User not found" })
            return
        }
        const playlists = await playlistModel.find({ creator: id })
        res.status(200).json({ msg: "Your playlists", playlists })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getPlaylist = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) {
            res.status(400).json({ msg: "Playlist id is required" })
            return
        }
        const playlist = await playlistModel.findById(id).populate("songs")
        if (!playlist) {
            res.status(404).json({ msg: "Playlist not found" })
            return
        }
        res.status(200).json({ msg: "Playlist found", playlist })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const addSongToPlaylist = async (req: Request, res: Response) => {
    try {
        const { songs } = req.body
        const { playlistId } = req.params
        const playlist = await playlistModel.findById(playlistId)
        if (!playlist) {
            res.status(404).json({ msg: "Playlist not found" })
            return
        }
        if (playlist.songs.includes(songs)) {
            res.status(400).json({ msg: "Song already exists in playlist" })
            return
        }
        playlist.songs.push(songs)
        await playlist.save()
        res.status(200).json({ msg: "Song added to playlist", playlist })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
    try {
        const { songs } = req.body
        const { playlistId } = req.params
        const playlist = await playlistModel.findById(playlistId)
        if (!playlist) {
            res.status(404).json({ msg: "Playlist not found" })
            return
        }
        playlist.songs = playlist.songs.filter((id) => id.toString() !== songs) as any
        await playlist.save()
        res.status(200).json({ msg: "Song removed successfully from playlist", playlist })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const deletePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params
        const playlist = await playlistModel.findByIdAndDelete(playlistId)
        if (!playlist) {
            res.status(404).json({ msg: "Playlist not found" })
            return
        }
        res.status(200).json({ msg: "Playlist deleted successfully" })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const updatePlaylist = async (req: Request, res: Response) => {
    try {
        const { playlistId } = req.params
        const { name } = req.body
        const playlist = await playlistModel.findByIdAndUpdate(playlistId, { name }, { returnDocument: "after" })
        if (!playlist) {
            res.status(404).json({ msg: "Playlist not found" })
            return
        }
        res.status(200).json({ msg: "Updated successfully", playlist })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}