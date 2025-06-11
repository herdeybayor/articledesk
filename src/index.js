import "dotenv/config"; // Load environment variables from .env file

import express from "express";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, like, and, or } from "drizzle-orm";
import { sql } from "drizzle-orm";

import * as schema from "./schema.js";

// Initialize database connection using environment variable
const db = drizzle(process.env.DB_FILE_NAME);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Authentication middleware
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If no token, return unauthorized
        if (!token) {
            return res.status(401).json({ error: "Not authorized, no token" });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database (exclude password)
            const user = await db
                .select({
                    id: schema.users.id,
                    name: schema.users.name,
                    email: schema.users.email,
                })
                .from(schema.users)
                .where(eq(schema.users.id, decoded.id));

            if (!user.length) {
                return res.status(401).json({ error: "User not found" });
            }

            // Set user in request object
            req.user = user[0];
            next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ error: "Not authorized, token failed" });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

// Route to home
app.get("/", (_, res) => {
    res.send("<h1>Welcome to the ArticleDesk</h1>");
});

// Route to get all articles with optional pagination
app.get("/articles", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const articles = await db.select().from(schema.articles).limit(parseInt(limit)).offset(offset);

        const totalCount = await db.select({ count: sql`count(*)` }).from(schema.articles);

        res.json({
            articles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: totalCount[0].count,
                totalPages: Math.ceil(totalCount[0].count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});

// Route to search articles with various filters
app.get("/articles/search", async (req, res) => {
    try {
        const { query, author, source, page = 1, limit = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        let conditions = [];

        // Add search conditions based on provided parameters
        if (query) {
            conditions.push(or(like(schema.articles.title, `%${query}%`), like(schema.articles.description, `%${query}%`), like(schema.articles.content, `%${query}%`)));
        }

        if (author) {
            conditions.push(like(schema.articles.author, `%${author}%`));
        }

        if (source) {
            conditions.push(or(like(schema.articles.sourceId, `%${source}%`), like(schema.articles.sourceName, `%${source}%`)));
        }

        // Combine all conditions with AND
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Execute the query with filters
        const articles = await db.select().from(schema.articles).where(whereClause).limit(parseInt(limit)).offset(offset);

        // Get total count for pagination info
        const countQuery = db.select({ count: sql`count(*)` }).from(schema.articles);

        if (whereClause) {
            countQuery.where(whereClause);
        }

        const totalCount = await countQuery;

        res.json({
            articles,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: totalCount[0].count,
                totalPages: Math.ceil(totalCount[0].count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error searching articles:", error);
        res.status(500).json({ error: "Failed to search articles" });
    }
});

// User registration endpoint
app.post("/auth/register", async (req, res) => {
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
app.post("/auth/login", async (req, res) => {
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

// Get user profile (protected route)
app.get("/user/profile", protect, async (req, res) => {
    try {
        // User is already attached to req object by the protect middleware
        res.json(req.user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

// Bookmarks table endpoints (protected routes)

// Get user bookmarks
app.get("/bookmarks", protect, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Join bookmarks with articles to get full article details
        const bookmarks = await db
            .select({
                bookmarkId: schema.bookmarks.id,
                articleId: schema.articles.id,
                title: schema.articles.title,
                description: schema.articles.description,
                url: schema.articles.url,
                source: schema.articles.sourceName,
                author: schema.articles.author,
                publishedAt: schema.articles.publishedAt,
                createdAt: schema.bookmarks.createdAt,
            })
            .from(schema.bookmarks)
            .innerJoin(schema.articles, eq(schema.bookmarks.articleId, schema.articles.id))
            .where(eq(schema.bookmarks.userId, req.user.id))
            .limit(parseInt(limit))
            .offset(offset)
            .orderBy(sql`${schema.bookmarks.createdAt} DESC`);

        // Get total count for pagination info
        const totalCount = await db
            .select({ count: sql`count(*)` })
            .from(schema.bookmarks)
            .where(eq(schema.bookmarks.userId, req.user.id));

        res.json({
            bookmarks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: totalCount[0].count,
                totalPages: Math.ceil(totalCount[0].count / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
});

// Add bookmark
app.post("/bookmarks", protect, async (req, res) => {
    try {
        const { articleId } = req.body;

        if (!articleId) {
            return res.status(400).json({ error: "Article ID is required" });
        }

        // Check if article exists
        const article = await db.select().from(schema.articles).where(eq(schema.articles.id, articleId));

        if (!article.length) {
            return res.status(404).json({ error: "Article not found" });
        }

        // Check if bookmark already exists
        const existingBookmark = await db
            .select()
            .from(schema.bookmarks)
            .where(and(eq(schema.bookmarks.userId, req.user.id), eq(schema.bookmarks.articleId, articleId)));

        if (existingBookmark.length > 0) {
            return res.status(400).json({ error: "Article already bookmarked" });
        }

        // Create bookmark
        const bookmark = await db
            .insert(schema.bookmarks)
            .values({
                userId: req.user.id,
                articleId: articleId,
                createdAt: new Date().toISOString(),
            })
            .returning();

        res.status(201).json(bookmark[0]);
    } catch (error) {
        console.error("Error creating bookmark:", error);
        res.status(500).json({ error: "Failed to create bookmark" });
    }
});

// Delete bookmark
app.delete("/bookmarks/:id", protect, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if bookmark exists and belongs to user
        const bookmark = await db
            .select()
            .from(schema.bookmarks)
            .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, req.user.id)));

        if (!bookmark.length) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        // Delete bookmark
        await db.delete(schema.bookmarks).where(eq(schema.bookmarks.id, id));

        res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        res.status(500).json({ error: "Failed to delete bookmark" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}\nVisit http://localhost:${port}`);
});
