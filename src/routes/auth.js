import express from "express";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Initialize database connection
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }

        // Check if user already exists
        const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const result = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
            })
            .returning({ id: users.id });

        // Generate JWT token
        const token = jwt.sign({ userId: result[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Set cookie with token
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

/**
 * Login user
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                password: users.password,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user.length) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Set cookie with token
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user[0].id,
                name: user[0].name,
                email: user[0].email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 * Requires authentication
 */
router.get("/profile", isAuthenticated, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

export default router;
