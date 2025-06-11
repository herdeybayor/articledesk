#!/bin/bash

# Production shutdown script for ArticleDesk
echo "🛑 Stopping ArticleDesk production services"

# Stop the main application
if [ -f .app.pid ]; then
    APP_PID=$(cat .app.pid)
    if ps -p $APP_PID > /dev/null; then
        echo "📰 Stopping main application (PID: $APP_PID)..."
        kill $APP_PID
        echo "✅ Application stopped"
    else
        echo "⚠️ Application process (PID: $APP_PID) not found"
    fi
    rm .app.pid
else
    echo "⚠️ Application PID file not found"
fi

# Stop the cron job
if [ -f .cron.pid ]; then
    CRON_PID=$(cat .cron.pid)
    if ps -p $CRON_PID > /dev/null; then
        echo "⏰ Stopping cron job (PID: $CRON_PID)..."
        kill $CRON_PID
        echo "✅ Cron job stopped"
    else
        echo "⚠️ Cron job process (PID: $CRON_PID) not found"
    fi
    rm .cron.pid
else
    echo "⚠️ Cron job PID file not found"
fi

echo "✨ All ArticleDesk services have been stopped" 