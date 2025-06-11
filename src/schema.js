import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Users table schema
 * Stores user authentication and profile information
 */
export const users = sqliteTable("users", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(), // Email must be unique for login
    password: text("password").notNull(), // Stores hashed password
    createdAt: text("created_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`), // Automatic creation timestamp
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`), // Last updated timestamp
});

/**
 * Articles table schema
 * Stores news articles information
 */
export const articles = sqliteTable("articles", {
    id: int("id").primaryKey({ autoIncrement: true }),
    sourceId: text("source_id"), // ID of the news source
    sourceName: text("source_name").notNull(), // Name of the news source
    author: text("author"), // Article author (optional)
    title: text("title").notNull(), // Article title
    description: text("description").notNull(), // Short description or summary
    url: text("url").notNull(), // Link to the original article
    urlToImage: text("url_to_image"), // Featured image URL (optional)
    publishedAt: text("published_at").notNull(), // Publication date
    content: text("content").notNull(), // Article content
});

/**
 * Bookmarks table schema
 * Stores user bookmarks for articles
 */
export const bookmarks = sqliteTable("bookmarks", {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(), // Reference to users table
    articleId: int("article_id").notNull(), // Reference to articles table
    createdAt: text("created_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`), // When the bookmark was created
});

/**
 * User preferences table schema
 * Stores user preferences for article filters
 */
export const userPreferences = sqliteTable("user_preferences", {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull().unique(), // One preference record per user
    defaultSources: text("default_sources"), // Comma-separated list of preferred sources
    defaultLanguage: text("default_language").default("en"), // Preferred language for articles
    defaultSearchTerm: text("default_search_term"), // Default search term
    updatedAt: text("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Search history table schema
 * Tracks user search queries for suggestions and analytics
 */
export const searchHistory = sqliteTable("search_history", {
    id: int("id").primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(), // User who performed the search
    searchQuery: text("search_query").notNull(), // The search term/query
    filters: text("filters"), // JSON string of filters used (date, source, etc.)
    resultCount: int("result_count"), // Number of results returned
    createdAt: text("created_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
});
