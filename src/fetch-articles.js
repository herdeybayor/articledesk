import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { articles } from "./schema.js";
import fetch from "node-fetch";
import { subDays } from "date-fns";

// Initialize database connection - match the same connection method used in index.js
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

// News API configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/everything"; // Using "everything" endpoint
const DEFAULT_PARAMS = {
    q: "nigeria", // Search for news about Nigeria
    from: subDays(new Date(), 1).toISOString().split("T")[0], // Yesterday's date in YYYY-MM-DD format
    sortBy: "publishedAt", // Sort by publish date
    pageSize: 100, // Maximum allowed by the free tier
};

async function fetchArticles(params = {}) {
    const queryParams = new URLSearchParams({
        ...DEFAULT_PARAMS,
        ...params,
        apiKey: NEWS_API_KEY,
    });

    const url = `${NEWS_API_URL}?${queryParams.toString()}`;

    try {
        console.log(`Fetching articles from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`News API error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching articles:", error);
        throw error;
    }
}

async function saveArticlesToDb(articlesData) {
    try {
        const articlesToInsert = articlesData.articles.map((article) => ({
            sourceId: article.source.id || null,
            sourceName: article.source.name,
            author: article.author || null,
            title: article.title,
            description: article.description || "",
            url: article.url,
            urlToImage: article.urlToImage || null,
            publishedAt: article.publishedAt,
            content: article.content || "",
        }));

        console.log(`Processing ${articlesToInsert.length} articles...`);

        // Get all existing article URLs from the database
        const existingArticles = await db.select({ url: articles.url }).from(articles);
        const existingUrls = new Set(existingArticles.map((a) => a.url));

        // Filter out articles that already exist in the database
        const newArticles = articlesToInsert.filter((article) => !existingUrls.has(article.url));

        console.log(`Found ${articlesToInsert.length - newArticles.length} existing articles, ${newArticles.length} new articles to save.`);

        if (newArticles.length === 0) {
            console.log("No new articles to save.");
            return 0;
        }

        // Insert articles in batches to avoid exceeding SQLite limits
        const batchSize = 50;
        for (let i = 0; i < newArticles.length; i += batchSize) {
            const batch = newArticles.slice(i, i + batchSize);
            await db.insert(articles).values(batch);
            console.log(`Saved batch ${i / batchSize + 1}/${Math.ceil(newArticles.length / batchSize)}`);
        }

        console.log("Articles saved successfully!");
        return newArticles.length;
    } catch (error) {
        console.error("Error saving articles to database:", error);
        throw error;
    }
}

async function main() {
    try {
        // You can customize these params as needed
        const params = {
            // Using the parameters from request.rest
            q: "nigeria", // Search term
            from: subDays(new Date(), 1).toISOString().split("T")[0], // Yesterday's date
            sortBy: "publishedAt",
        };

        const data = await fetchArticles(params);
        console.log(`Fetched ${data.totalResults} articles. Processing...`);

        const savedCount = await saveArticlesToDb(data);
        console.log(`Successfully processed ${savedCount} articles`);
    } catch (error) {
        console.error("Script failed:", error);
        process.exit(1);
    } finally {
        client.close();
    }
}

main();
