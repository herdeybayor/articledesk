# Deployment Guide

This guide explains how to deploy the News Bookmark application using Docker.

## Prerequisites

-   Docker installed on your system
-   Docker Compose installed on your system

## Environment Variables

Before deploying, create a `.env` file with the following variables:

```env
# Database
DB_FILE_NAME=./local.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_here

# News API Configuration (if using external news APIs)
NEWS_API_KEY=your_news_api_key_here

# Application Configuration
PORT=3000
NODE_ENV=production
```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Build and start the application:**

    ```bash
    docker-compose up -d
    ```

2. **View logs:**

    ```bash
    docker-compose logs -f app
    ```

3. **Stop the application:**
    ```bash
    docker-compose down
    ```

### Using Docker directly

1. **Build the image:**

    ```bash
    docker build -t news-bookmark:latest .
    ```

2. **Run the container:**
    ```bash
    docker run -d \
      --name news-bookmark-app \
      -p 3000:3000 \
      -v news_data:/app/data \
      -v news_logs:/app/logs \
      --env-file .env \
      news-bookmark:latest
    ```

## Development

### Using Docker Compose

1. **Start development environment:**

    ```bash
    docker-compose --profile dev up app-dev
    ```

    This will:

    - Mount your source code for hot reloading
    - Start the application with nodemon
    - Use development settings

2. **Stop development environment:**
    ```bash
    docker-compose --profile dev down
    ```

## Database Migrations

To run database migrations in the container:

```bash
# Using docker-compose
docker-compose exec app npm run db:migrate

# Using docker directly
docker exec news-bookmark-app npm run db:migrate
```

## Health Checks

The Docker setup includes health checks that verify the application is running correctly. You can check the health status:

```bash
# Using docker-compose
docker-compose ps

# Using docker directly
docker ps
```

## Data Persistence

-   **Database**: Stored in the `app_data` volume at `/app/data/app.db`
-   **Logs**: Stored in the `app_logs` volume at `/app/logs/`

## Troubleshooting

### View application logs

```bash
docker-compose logs app
```

### Access container shell

```bash
docker-compose exec app sh
```

### Reset database (development only)

```bash
docker-compose down -v  # This removes volumes
docker-compose up -d
```

## Scaling and Production Considerations

For production deployment, consider:

1. **Use a reverse proxy** (nginx, traefik) for SSL termination
2. **Set up log rotation** for the log files
3. **Configure backup** for the SQLite database
4. **Use environment-specific compose files** for different environments
5. **Set up monitoring** and alerting

### Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Notes

-   The Docker container runs as a non-root user for security
-   Remember to set strong values for JWT_SECRET and other sensitive environment variables
-   Keep your Docker images updated with security patches
-   Consider using Docker secrets for sensitive data in production environments
