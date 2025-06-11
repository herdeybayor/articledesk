import "dotenv/config"; // Load environment variables from .env file

import express from "express";
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle(process.env.DB_FILE_NAME);

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "Welcome to the API",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (req, res) => {
    res.send("OK");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}\nVisit http://localhost:${port}`);
});
