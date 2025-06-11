# News Bookmark

A simple application to fetch and store news articles from News API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
DATABASE_URL=file:./local.db
NEWS_API_KEY=your_news_api_key_here
PORT=3000
```

3. Get a News API key from [https://newsapi.org/](https://newsapi.org/) and add it to your `.env` file.

## Usage

### Fetch Articles

To fetch news articles and save them to the database:

```bash
node src/fetch-articles.js
```

By default, this will fetch technology news from the US. You can modify the parameters in the `main()` function of the script to fetch different categories or from different countries.

### Run the Server

To start the API server:

```bash
npm run dev
```

## Database

This project uses SQLite with Drizzle ORM for database operations.

-   To generate database migrations:

```bash
npm run db:generate
```

-   To run database migrations:

```bash
npm run db:migrate
```

-   To explore the database using Drizzle Studio:

```bash
npm run db:studio
```
