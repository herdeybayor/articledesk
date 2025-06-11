import "dotenv/config"; // Load environment variables from .env file

import express from "express";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import * as schema from "./schema.js";

// Initialize database connection using environment variable
const db = drizzle(process.env.DB_FILE_NAME);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Route to get all articles
app.get("/", async (req, res) => {
    try {
        const articles = await db.select().from(schema.articles);
        res.json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});

// User registration endpoint
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password for security
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create new user in database
        const user = await db
            .insert(schema.users)
            .values({
                name,
                email,
                password: hashedPassword,
            })
            .returning({
                id: schema.users.id,
                name: schema.users.name,
                email: schema.users.email,
            });

        // Generate JWT token for authentication
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        // Return user info and token (excluding password)
        res.json({ user: user[0], token });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

// User login endpoint
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        const user = await db.select().from(schema.users).where(eq(schema.users.email, email));

        // Check if user exists and password matches
        if (user.length === 0 || !bcrypt.compareSync(password, user[0].password)) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate new JWT token
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: "30d" });

        // Update user's auth token in database
        await db
            .update(schema.users)
            .set({
                authToken: token,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.users.id, user[0].id));

        // Remove password from user object before sending response
        const userResponse = {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
        };

        res.json({ user: userResponse, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.send("OK");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}\nVisit http://localhost:${port}`);
});
