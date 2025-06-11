# ArticleDesk

A web application for searching news articles and saving them as bookmarks for later reading.

## Features

-   **Article Search**: Search news articles by keyword, date range, source, and language
-   **User Authentication**: Register and login to save your preferences
-   **Bookmarks**: Save articles for later reading and manage your bookmark collection
-   **Responsive Design**: Works on desktop and mobile devices
-   **Automated Article Fetching**: Scheduled cron job to regularly fetch new articles

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: EJS templates, Bootstrap 5, JavaScript
-   **Database**: SQLite (via Drizzle ORM)
-   **API**: NewsAPI for article fetching
-   **Scheduling**: node-cron for automated tasks

## Setup

### Prerequisites

-   Node.js (v14+)
-   npm or yarn
-   NewsAPI key (get one at [newsapi.org](https://newsapi.org/))

### Installation

1. Clone the repository:

    ```
    git clone <repository-url>
    cd news-bookmark
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file based on the provided example:

    ```
    cp .env.example .env
    ```

    Then edit the `.env` file to add your actual API keys and secrets.

4. Set up the database:

    ```
    npm run db:generate
    npm run db:push
    ```

5. Fetch initial articles:

    ```
    npm run fetch:articles
    ```

6. Start the development server:

    ```
    npm run dev
    ```

7. Visit `http://localhost:3000` in your browser

## Scripts

-   `npm run dev`: Start development server with hot reload
-   `npm run start`: Start production server
-   `npm run fetch:articles`: Fetch and store latest articles
-   `npm run cron:start`: Start the cron job for scheduled article fetching
-   `npm run start:all`: Start both the main application and cron job
-   `npm run db:generate`: Generate database migrations
-   `npm run db:push`: Apply migrations to database
-   `npm run db:studio`: Launch Drizzle Studio to visualize database

## Production Deployment

For production deployment, you can use the provided shell scripts:

1. Start all services:

    ```
    ./start-production.sh
    ```

2. Stop all services:
    ```
    ./stop-production.sh
    ```

The production scripts will:

-   Run the application in production mode
-   Start the cron job for scheduled article fetching
-   Save logs to the `logs/` directory
-   Track process IDs for easy management

## Project Structure

```
articledesk/
├── public/               # Static assets
│   └── css/              # Stylesheets
├── logs/                 # Log files for production
├── src/                  # Application source code
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── fetch-articles.js # Script to fetch articles
│   ├── cron-fetch.js     # Cron job for scheduled fetching
│   ├── index.js          # Main application entry
│   └── schema.js         # Database schema
├── views/                # EJS templates
├── start-production.sh   # Production startup script
├── stop-production.sh    # Production shutdown script
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## License

ISC
