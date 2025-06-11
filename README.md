# ArticleDesk

A web application for searching news articles and saving them as bookmarks for later reading.

## Features

-   **Article Search**: Search news articles by keyword, date range, source, and language
-   **User Authentication**: Register and login to save your preferences
-   **Bookmarks**: Save articles for later reading and manage your bookmark collection
-   **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: EJS templates, Bootstrap 5, JavaScript
-   **Database**: SQLite (via Drizzle ORM)
-   **API**: NewsAPI for article fetching

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

3. Create a `.env` file in the root directory with the following variables:

    ```
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    NEWS_API_KEY=your_newsapi_key
    DB_FILE_NAME=file:./local.db
    NODE_ENV=development
    ```

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
-   `npm run db:generate`: Generate database migrations
-   `npm run db:push`: Apply migrations to database
-   `npm run db:studio`: Launch Drizzle Studio to visualize database

## Project Structure

```
articledesk/
├── public/               # Static assets
│   └── css/              # Stylesheets
├── src/                  # Application source code
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── fetch-articles.js # Script to fetch articles
│   ├── index.js          # Main application entry
│   └── schema.js         # Database schema
├── views/                # EJS templates
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## License

ISC
