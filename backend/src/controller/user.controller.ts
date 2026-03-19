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
        if (password.length > 20) {
            res.status(400).json({ msg: "Password too long" })
            return
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            res.status(400).json({ msg: "User not available" })
            return
        }
        const passwordValidation = await bcrypt.compare(password, user.password)
        if (!passwordValidation) {
            res.status(401).json({ msg: "Invalid credentials" })
            return
        }
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