import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import "dotenv/config";

// Get the directory name with ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the fetch-articles.js script
const fetchArticlesScript = path.join(__dirname, "fetch-articles.js");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path
const logFile = path.join(logsDir, "fetch-articles.log");

// Get cron schedule from environment variable or use default (hourly)
// Format: minute hour day-of-month month day-of-week
// Examples:
// - Every hour: '0 * * * *'
// - Every 30 minutes: '*/30 * * * *'
// - Every day at midnight: '0 0 * * *'
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 * * * *";

console.log("📰 ArticleDesk Cron Job started");
console.log(`Schedule: ${CRON_SCHEDULE} (${getCronDescription(CRON_SCHEDULE)})`);
console.log(`Logs will be written to: ${logFile}`);

// Schedule the cron job according to the configured schedule
cron.schedule(CRON_SCHEDULE, () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Running fetch articles script...`);

    // Execute the fetch articles script
    exec(`node ${fetchArticlesScript}`, (error, stdout, stderr) => {
        const logEntry = `
=== ${timestamp} ===
${stdout}
${stderr ? "ERROR: " + stderr : ""}
${error ? "EXECUTION ERROR: " + error.message : ""}
`;

        // Append to log file
        fs.appendFile(logFile, logEntry, (err) => {
            if (err) {
                console.error("Failed to write to log file:", err);
            }
        });

        if (error) {
            console.error(`[${timestamp}] Error: ${error.message}`);
            return;
        }

        console.log(`[${timestamp}] Fetch articles completed successfully`);
    });
});

// Also run once when the script starts
console.log("Running initial fetch...");
exec(`node ${fetchArticlesScript}`, (error, stdout, stderr) => {
    const timestamp = new Date().toISOString();
    const logEntry = `
=== INITIAL RUN ${timestamp} ===
${stdout}
${stderr ? "ERROR: " + stderr : ""}
${error ? "EXECUTION ERROR: " + error.message : ""}
`;

    // Append to log file
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });

    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }

    console.log("Initial fetch completed successfully");
});

// Helper function to provide a human-readable description of the cron schedule
function getCronDescription(cronExpression) {
    const parts = cronExpression.split(" ");

    // Basic descriptions for common patterns
    if (cronExpression === "0 * * * *") {
        return "every hour at minute 0";
    } else if (cronExpression === "*/30 * * * *") {
        return "every 30 minutes";
    } else if (cronExpression === "0 0 * * *") {
        return "every day at midnight";
    } else if (parts[0].startsWith("*/") && parts[1] === "*") {
        return `every ${parts[0].substring(2)} minutes`;
    } else {
        return "custom schedule";
    }
}
