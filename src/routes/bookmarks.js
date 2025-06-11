import express from "express";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { bookmarks, articles } from "../schema.js";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Initialize database connection
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

// Middleware to ensure users are logged in for all bookmark routes
router.use(isAuthenticated);

/**
 * Get all bookmarks for the current user
 * GET /api/bookmarks
 */
router.get("/", async (req, res) => {
    try {
        // Join bookmarks with articles to get full article data
        const userBookmarks = await db
            .select({
                bookmarkId: bookmarks.id,
                articleId: articles.id,
                title: articles.title,
                description: articles.description,
                url: articles.url,
                urlToImage: articles.urlToImage,
                publishedAt: articles.publishedAt,
                sourceName: articles.sourceName,
                bookmarkedAt: bookmarks.createdAt,
            })
            .from(bookmarks)
            .innerJoin(articles, eq(bookmarks.articleId, articles.id))
            .where(eq(bookmarks.userId, req.user.id))
            .orderBy(bookmarks.createdAt);

        res.json(userBookmarks);
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
});

/**
 * Add a bookmark
 * POST /api/bookmarks
 * Body: { articleId: number }
 */
router.post("/", async (req, res) => {
    try {
        const { articleId } = req.body;

        if (!articleId) {
            return res.status(400).json({ error: "Article ID is required" });
        }

        // Check if article exists
        const articleExists = await db.select({ id: articles.id }).from(articles).where(eq(articles.id, articleId)).limit(1);

        if (!articleExists.length) {
            return res.status(404).json({ error: "Article not found" });
        }

        // Check if bookmark already exists
        const existingBookmark = await db
            .select({ id: bookmarks.id })
            .from(bookmarks)
            .where(and(eq(bookmarks.userId, req.user.id), eq(bookmarks.articleId, articleId)))
            .limit(1);

        if (existingBookmark.length) {
            return res.status(409).json({
                error: "Article already bookmarked",
                bookmarkId: existingBookmark[0].id,
            });
        }

        // Create new bookmark
        const result = await db
            .insert(bookmarks)
            .values({
                userId: req.user.id,
                articleId: articleId,
            })
            .returning({ id: bookmarks.id });

        res.status(201).json({
            message: "Bookmark added successfully",
            bookmarkId: result[0].id,
        });
    } catch (error) {
        console.error("Error adding bookmark:", error);
        res.status(500).json({ error: "Failed to add bookmark" });
    }
});

/**
 * Get bookmark count for the current user
 * GET /api/bookmarks/count
 */
router.get("/count", async (req, res) => {
    try {
        const result = await db.select({ count: bookmarks.id }).from(bookmarks).where(eq(bookmarks.userId, req.user.id));

        res.json({ count: Number(result[0].count) || 0 });
    } catch (error) {
        console.error("Error counting bookmarks:", error);
        res.status(500).json({ error: "Failed to count bookmarks" });
    }
});

/**
 * Remove a bookmark
 * DELETE /api/bookmarks/:id
 */
router.delete("/:id", async (req, res) => {
    try {
        const bookmarkId = parseInt(req.params.id);

        // Check if bookmark exists and belongs to current user
        const bookmarkExists = await db
            .select({ id: bookmarks.id })
            .from(bookmarks)
            .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.userId, req.user.id)))
            .limit(1);

        if (!bookmarkExists.length) {
            return res.status(404).json({ error: "Bookmark not found" });
        }

        // Delete the bookmark
        await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));

        res.json({ message: "Bookmark removed successfully" });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        res.status(500).json({ error: "Failed to remove bookmark" });
    }
});

export default router;
