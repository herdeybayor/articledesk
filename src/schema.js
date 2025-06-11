import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
    id: int("id").primaryKey({ autoIncrement: true }),
    sourceId: text("source_id"),
    sourceName: text("source_name").notNull(),
    author: text("author"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    url: text("url").notNull(),
    urlToImage: text("url_to_image"),
    publishedAt: text("published_at").notNull(),
    content: text("content").notNull(),
});
