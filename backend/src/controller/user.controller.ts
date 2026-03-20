import type { Request, Response } from "express";
import { userModel } from "../model/user.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const jwtSecret = process.env.JWT_SECRET || ""
console.log("value", jwtSecret)

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, avatar } = req.body
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            res.status(401).json({ msg: "User already registered" })
            return
        }
        if (password.length < 6 || password.length > 20) {
            res.status(400).json({ msg: "Password should be between 6 and 20 characters" })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await userModel.create({ name, email, password: hashedPassword, avatar })
        res.status(201).json({ msg: "User registered successfully", user })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        console.log("Login attempt:", email, password)

        if (password.length > 20) {
            res.status(400).json({ msg: "Password too long" })
            return
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            res.status(400).json({ msg: "User not available" })
            return
        }
        console.log("User found:", user?.email)
        const passwordValidation = await bcrypt.compare(password, user.password)
        if (!passwordValidation) {
            res.status(401).json({ msg: "Invalid credentials" })
            return

        }

        console.log("Password match:", passwordValidation)
        const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "30d" })
        res.cookie("userToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({ msg: "User logged in successfully", user })
        return
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.user
        const avatar = req.file?.path
        const { name } = req.body

        const user = await userModel.findByIdAndUpdate(id, {
            name, avatar
        }, { returnDocument: "after" })
        if (!user) {
            res.status(401).json({
                msg: "User not found"
            })
            return
        }
        res.status(200).json({
            msg: "updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        })
        return
    } catch (error) {
        res.status(500).json({
            msg: "Internal server error"
        })
    }
}

export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie("userToken", {
            httpOnly: true,
            sameSite: "none",
            secure: true
        })
        res.status(200).json({ msg: "Logged out successfully" })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (email !== adminEmail || password !== adminPassword) {
            res.status(401).json({ msg: "Invalid admin credentials" })
            return
        }
        const token = jwt.sign({ role: "admin", email }, jwtSecret, { expiresIn: "1d" })
        res.cookie("adminToken", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.status(200).json({ msg: "Admin logged in successfully", admin: { email, role: "admin" } })
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const toggleLikeSong = async (req: Request, res: Response) => {
    try {
        const songId = req.params.songId as string
        const userId = req.user._id

        const user = await userModel.findById(userId)
        if (!user) {
            res.status(404).json({ msg: "User not found" })
            return
        }

        const alreadyLiked = user.likedSongs.includes(songId as any)

        if (alreadyLiked) {

            user.likedSongs = user.likedSongs.filter(
                (id) => id.toString() !== songId
            ) as any
            await user.save()
            res.status(200).json({ msg: "Song unliked", liked: false })
        } else {

            user.likedSongs.push(songId as any)
            await user.save()
            res.status(200).json({ msg: "Song liked", liked: true })
        }
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}

export const getLikedSongs = async (req: Request, res: Response) => {
    try {
        const user = await userModel
            .findById(req.user._id)
            .populate("likedSongs")

        if (!user) {
            res.status(404).json({ msg: "User not found" })
            return
        }

        res.status(200).json({ msg: "Liked songs", songs: user.likedSongs })
        return
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" })
    }
}