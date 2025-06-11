import "dotenv/config"; // Load environment variables from .env file
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, like, and, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import expressLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";

import * as schema from "./schema.js";

// Route imports
import authRoutes from "./routes/auth.js";
import articleRoutes from "./routes/articles.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import { optionalAuth } from "./middleware/auth.js";

// Initialize database connection
const client = createClient({
    url: process.env.DB_FILE_NAME || "file:../local.db",
});

const db = drizzle(client);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get the directory name with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser());

// Set up view engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "layout");
app.set("layout extractScripts", true);

// Optional authentication for all routes
app.use(optionalAuth);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

// View Routes
app.get("/", (req, res) => {
    console.log("req.user", req.user);
    res.render("index", {
        title: "News Bookmark",
        user: req.user || null,
    });
});

app.get("/search", (req, res) => {
    res.render("search", {
        title: "Search Articles",
        user: req.user || null,
        query: req.query.q || "",
    });
});

app.get("/bookmarks", (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    res.render("bookmarks", {
        title: "My Bookmarks",
        user: req.user,
    });
});

app.get("/login", (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("login", {
        title: "Login",
        user: null,
    });
});

app.get("/register", (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("register", {
        title: "Register",
        user: null,
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", {
        title: "Error",
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err : {},
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
