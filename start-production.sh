#!/bin/bash

# Production startup script for ArticleDesk
echo "🚀 Starting ArticleDesk in production mode"

# Set NODE_ENV to production
export NODE_ENV=production

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the main application
echo "📰 Starting main application server..."
node src/index.js > logs/app.log 2>&1 &
APP_PID=$!
echo "✅ Application started with PID: $APP_PID"

# Start the cron job for article fetching
echo "⏰ Starting article fetch cron job..."
node src/cron-fetch.js > logs/cron.log 2>&1 &
CRON_PID=$!
echo "✅ Cron job started with PID: $CRON_PID"

# Save PIDs to a file for later management
echo "$APP_PID" > .app.pid
echo "$CRON_PID" > .cron.pid

echo "📝 Log files:"
echo "   - Application: logs/app.log"
echo "   - Cron job: logs/cron.log"
echo "   - Article fetching: logs/fetch-articles.log"

echo "✨ ArticleDesk is now running in production mode"
echo "💡 To stop the services, run: ./stop-production.sh" 