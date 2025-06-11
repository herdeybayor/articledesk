import express from "express";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { articles } from "../schema.js";
import { eq, like, and, gte, lte } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth.js";
import { sql } from "drizzle-orm";

const router = express.Router();

// Initialize database connection
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

/**
 * Get all articles with optional pagination
 * GET /api/articles?page=1&limit=10
 */
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get articles with pagination
        const results = await db
            .select()
            .from(articles)
            .orderBy(sql`${articles.publishedAt} DESC`)
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const totalCount = await db.select({ count: sql`count(*)` }).from(articles);

        res.json({
            articles: results,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.count || 0,
                pages: Math.ceil((totalCount[0]?.count || 0) / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});

/**
 * Get sources for filtering
 * GET /api/articles/sources
 */
router.get("/sources", async (req, res) => {
    try {
        const sources = await db.selectDistinct({ sourceName: articles.sourceName }).from(articles);
        res.json(sources.map((s) => s.sourceName).sort());
    } catch (error) {
        console.error("Error fetching sources:", error);
        res.status(500).json({ error: "Failed to fetch sources" });
    }
});

/**
 * Search articles with filters
 * GET /api/articles/search?q=term&from=date&to=date&source=name&language=code
 */
router.get("/search", async (req, res) => {
    try {
        const { q, from, to, source, language } = req.query;

        // Build query conditions
        const conditions = [];

        // Search term (in title or description)
        if (q) {
            conditions.push(like(articles.title, `%${q}%`) || like(articles.description, `%${q}%`) || like(articles.content, `%${q}%`));
        }

        // Date range filters
        if (from) {
            conditions.push(gte(articles.publishedAt, from));
        }

        if (to) {
            conditions.push(lte(articles.publishedAt, to));
        }

        // Source filter
        if (source) {
            conditions.push(eq(articles.sourceName, source));
        }

        // Execute the query with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const query = db.select().from(articles);

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const results = await query.limit(limit).offset(offset);

        // Get total count for pagination
        const countQuery = db.select({ count: sql`count(*)` }).from(articles);
        if (conditions.length > 0) {
            countQuery.where(and(...conditions));
        }

        const totalCount = await countQuery;

        // Save search to history if user is authenticated
        if (req.user) {
            // We'll implement this in the searchHistory route
        }

        res.json({
            articles: results,
            pagination: {
                page,
                limit,
                total: totalCount[0]?.count || 0,
                pages: Math.ceil((totalCount[0]?.count || 0) / limit),
            },
        });
    } catch (error) {
        console.error("Error searching articles:", error);
        res.status(500).json({ error: "Failed to search articles" });
    }
});

/**
 * Get article by ID
 * GET /api/articles/:id
 */
router.get("/:id", async (req, res) => {
    try {
        // Make sure id is a valid number
        const articleId = parseInt(req.params.id);

        if (isNaN(articleId)) {
            return res.status(400).json({ error: "Invalid article ID. Must be a number." });
        }

        const article = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);

        if (!article.length) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json(article[0]);
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({ error: "Failed to fetch article" });
    }
});

export default router;
