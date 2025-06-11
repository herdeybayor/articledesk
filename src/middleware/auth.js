import jwt from "jsonwebtoken";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users } from "../schema.js";
import { eq } from "drizzle-orm";

// Initialize database connection
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from authorization header or cookies
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);

        if (!user.length) {
            return res.status(401).json({ error: "User not found" });
        }

        // Attach user to request object
        req.user = user[0];
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        res.status(500).json({ error: "Authentication failed" });
    }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block the request if not
 */
export const optionalAuth = async (req, res, next) => {
    try {
        // Get token from authorization header or cookies
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next(); // Continue without authentication
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists
        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);

        if (user.length) {
            // Attach user to request object
            req.user = user[0];
        }

        next();
    } catch (error) {
        // If token is invalid, continue without authentication
        next();
    }
};
