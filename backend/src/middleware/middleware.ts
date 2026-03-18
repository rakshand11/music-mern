import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { userModel } from "../model/user.model.js";
dotenv.config()

interface JwtPayload {
    userId: string;
    role?: string;
    admin?: string
    email?: string
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
            userId?: string;
            admin?: JwtPayload;
        }
    }
}

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.userToken
        if (!token) {
            res.status(401).json({ msg: "Access denied, no token provided" })
            return
        }
        const jwtSecret = process.env.JWT_SECRET || ""
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload
        const user = await userModel.findById(decoded.userId)
        if (!user) {
            res.status(401).json({ msg: "User not found" })
            return
        }
        req.user = user
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ msg: "Invalid token" })
        return
    }
}

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.adminToken
    if (!token) {
        res.status(401).json({ msg: "Access denied, no token found" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload
        req.admin = decoded
        if (req.admin?.email === process.env.ADMIN_EMAIL) {
            next()
        } else {
            res.status(401).json({ msg: "Not authorised" })
            return
        }
    } catch (error) {
        res.status(401).json({ msg: "Internal server error" })
        return
    }
}