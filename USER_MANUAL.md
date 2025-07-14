# 📰 ArticleDesk User Manual

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [User Registration & Authentication](#user-registration--authentication)
4. [Main Features](#main-features)
5. [Search & Filtering](#search--filtering)
6. [Bookmark Management](#bookmark-management)
7. [User Profile](#user-profile)
8. [API Documentation](#api-documentation)
9. [Administrator Guide](#administrator-guide)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Overview

**ArticleDesk** is a comprehensive news article management platform that allows users to:

-   🔍 **Search and discover** news articles from various sources
-   📌 **Bookmark articles** for later reading
-   👤 **Manage personal profiles** and preferences
-   🎯 **Filter content** by date, source, and keywords
-   📱 **Access content** on both desktop and mobile devices

### Key Benefits

-   **Centralized News Hub**: Access articles from multiple news sources in one place
-   **Personal Library**: Save articles to read later with your bookmarking system
-   **Advanced Search**: Find specific articles with powerful filtering options
-   **User-Friendly Interface**: Clean, responsive design that works on all devices
-   **Automated Updates**: Fresh articles are automatically fetched and added to the database

---

## Getting Started

### System Requirements

-   Modern web browser (Chrome, Firefox, Safari, Edge)
-   Internet connection
-   JavaScript enabled

### Accessing ArticleDesk

1. Open your web browser
2. Navigate to the ArticleDesk URL (e.g., `http://localhost:3000` for local development)
3. You'll see the homepage with featured articles

### First Time Setup

If you're a new user:

1. Click **"Register"** in the navigation menu
2. Create your account (see [User Registration](#user-registration--authentication))
3. Start exploring articles and saving bookmarks!

---

## User Registration & Authentication

### Creating an Account

1. **Navigate to Registration**

    - Click "Register" in the top navigation
    - Or visit `/register` directly

2. **Fill in Your Details**

    - **Full Name**: Your display name
    - **Email Address**: Must be unique and valid
    - **Password**: Choose a secure password
    - **Confirm Password**: Re-enter your password

3. **Submit Registration**
    - Click "Create Account"
    - You'll be automatically logged in and redirected to the homepage

### Logging In

1. **Go to Login Page**

    - Click "Login" in the navigation
    - Or visit `/login` directly

2. **Enter Credentials**

    - **Email**: Your registered email address
    - **Password**: Your account password

3. **Access Your Account**
    - Click "Sign In"
    - You'll be redirected to the homepage with access to all features

### Logging Out

-   Click "Logout" in the navigation menu
-   You'll be redirected to the homepage as a guest user

### Account Security

-   Passwords are securely hashed using bcrypt
-   Sessions are managed with JWT tokens
-   Automatic logout on browser close for security

---

## Main Features

### Homepage Dashboard

The homepage displays:

-   **Latest Articles**: Recently fetched news articles
-   **Navigation Menu**: Access to all main features
-   **Search Bar**: Quick article search functionality
-   **User Status**: Shows if you're logged in and provides user menu

### Article Display

Each article shows:

-   **Headline**: Article title
-   **Source**: News organization that published the article
-   **Publication Date**: When the article was published
-   **Description**: Brief summary or excerpt
-   **Featured Image**: Associated image (when available)
-   **Bookmark Button**: Save/unsave articles (logged-in users only)

### Navigation Structure

-   **Home** (`/`): Main dashboard with latest articles
-   **Search** (`/search`): Advanced search and filtering
-   **Bookmarks** (`/bookmarks`): Your saved articles (requires login)
-   **Profile** (`/profile`): Account settings and information (requires login)
-   **Login/Register**: Authentication pages

---

## Search & Filtering

### Basic Search

1. **Quick Search**: Use the search bar on any page
2. **Search Page**: Visit `/search` for advanced options

### Advanced Search Options

#### **Keyword Search**

-   Search in article titles, descriptions, and content
-   Use multiple keywords for broader results
-   Example: "technology startup" finds articles about both topics

#### **Date Range Filtering**

-   **From Date**: Show articles published after this date
-   **To Date**: Show articles published before this date
-   Format: YYYY-MM-DD (e.g., 2024-01-15)

#### **Source Filtering**

-   Filter by specific news organizations
-   Select from dropdown of available sources
-   Examples: BBC, CNN, Reuters, etc.

#### **Search Tips**

-   **Broad Terms**: Use general keywords for more results
-   **Specific Terms**: Use exact phrases for precise results
-   **Combine Filters**: Use multiple filters for targeted searches
-   **Date Ranges**: Limit searches to recent articles for current events

### Search Results

-   **Pagination**: Results are displayed in pages (10 articles per page)
-   **Sorting**: Articles are sorted by publication date (newest first)
-   **Result Count**: Shows total number of matching articles

---

## Bookmark Management

### Adding Bookmarks

1. **Find an Article**: Use search or browse the homepage
2. **Click Bookmark**: Click the bookmark button on any article
3. **Confirmation**: The button will show it's been saved

### Viewing Your Bookmarks

1. **Access Bookmarks**: Click "Bookmarks" in the navigation
2. **Browse Collection**: View all your saved articles
3. **Article Details**: See full information for each bookmarked article

### Bookmark Features

-   **Automatic Saving**: Bookmarks are instantly saved to your account
-   **No Duplicates**: Can't bookmark the same article twice
-   **Quick Access**: View all bookmarks from one dedicated page
-   **Rich Information**: Bookmarks include title, description, source, and date

### Removing Bookmarks

1. **Go to Bookmarks**: Visit your bookmarks page
2. **Remove Article**: Click the remove/delete button on unwanted bookmarks
3. **Instant Update**: The bookmark is immediately removed from your collection

### Bookmark Organization

-   **Chronological Order**: Bookmarks are sorted by when you saved them
-   **Source Information**: See which news organization published each article
-   **Quick Links**: Click article titles to read the full article on the original site

---

## User Profile

### Accessing Your Profile

-   Click "Profile" in the navigation menu (requires login)
-   Or visit `/profile` directly

### Profile Information

Your profile displays:

-   **Account Details**: Name and email address
-   **Account Statistics**: Number of bookmarks saved
-   **Member Since**: When you joined ArticleDesk

### Profile Management

-   **View Account Info**: See your current account details
-   **Bookmark Count**: Track how many articles you've saved
-   **Account History**: See when you created your account

---

## API Documentation

ArticleDesk provides REST API endpoints for programmatic access:

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Article Endpoints

#### Get All Articles

```
GET /api/articles?page=1&limit=10
```

#### Search Articles

```
GET /api/articles/search?q=keyword&from=2024-01-01&to=2024-12-31&source=BBC
```

#### Get Single Article

```
GET /api/articles/:id
```

#### Get Available Sources

```
GET /api/articles/sources
```

### Bookmark Endpoints (Requires Authentication)

#### Get User Bookmarks

```
GET /api/bookmarks
Authorization: Bearer <jwt_token>
```

#### Add Bookmark

```
POST /api/bookmarks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "articleId": 123
}
```

#### Remove Bookmark

```
DELETE /api/bookmarks/:id
Authorization: Bearer <jwt_token>
```

#### Get Bookmark Count

```
GET /api/bookmarks/count
Authorization: Bearer <jwt_token>
```

### Response Formats

#### Success Response

```json
{
  "articles": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

#### Error Response

```json
{
    "error": "Error message description"
}
```

---

## Administrator Guide

### System Architecture

-   **Frontend**: EJS templates with Bootstrap 5 styling
-   **Backend**: Node.js with Express.js framework
-   **Database**: SQLite with Drizzle ORM
-   **Authentication**: JWT tokens with bcrypt password hashing
-   **News Source**: NewsAPI.org integration

### Database Schema

#### Users Table

-   `id`: Primary key
-   `name`: User's full name
-   `email`: Unique email address
-   `password`: Hashed password
-   `createdAt`: Account creation timestamp
-   `updatedAt`: Last modification timestamp

#### Articles Table

-   `id`: Primary key
-   `sourceId`: News source identifier
-   `sourceName`: Name of news organization
-   `author`: Article author
-   `title`: Article headline
-   `description`: Article summary
-   `url`: Link to original article
-   `urlToImage`: Featured image URL
-   `publishedAt`: Publication timestamp
-   `content`: Article content

#### Bookmarks Table

-   `id`: Primary key
-   `userId`: Reference to users table
-   `articleId`: Reference to articles table
-   `createdAt`: Bookmark creation timestamp

### Automated Systems

#### Article Fetching

-   **Cron Job**: Automatically fetches new articles
-   **News API**: Integrates with NewsAPI.org
-   **Scheduling**: Configurable fetch intervals
-   **Error Handling**: Robust error handling and logging

#### Data Management

-   **Deduplication**: Prevents duplicate articles
-   **Storage**: Efficient SQLite database storage
-   **Indexing**: Optimized for search performance

### Configuration

Key environment variables:

-   `NEWS_API_KEY`: NewsAPI.org API key
-   `JWT_SECRET`: Secret for JWT token signing
-   `DB_FILE_NAME`: Database file path
-   `PORT`: Application port (default: 3000)

---

## Troubleshooting

### Common Issues

#### Cannot Access ArticleDesk

**Problem**: Page won't load or shows error
**Solutions**:

-   Check your internet connection
-   Verify the URL is correct
-   Try refreshing the page
-   Clear browser cache and cookies
-   Try a different web browser

#### Login Issues

**Problem**: Cannot log in with correct credentials
**Solutions**:

-   Double-check email and password spelling
-   Ensure Caps Lock is off
-   Try resetting your password (contact administrator)
-   Clear browser cookies for the site
-   Disable browser extensions that might interfere

#### Search Not Working

**Problem**: Search returns no results or errors
**Solutions**:

-   Try different keywords or broader search terms
-   Check date range filters aren't too restrictive
-   Ensure JavaScript is enabled in your browser
-   Try searching without filters first
-   Refresh the page and try again

#### Bookmarks Not Saving

**Problem**: Bookmark button doesn't work
**Solutions**:

-   Ensure you're logged in to your account
-   Check your internet connection
-   Try refreshing the page
-   Log out and log back in
-   Contact administrator if issue persists

#### Performance Issues

**Problem**: Site is slow or unresponsive
**Solutions**:

-   Check your internet connection speed
-   Close other browser tabs using resources
-   Clear browser cache
-   Try during off-peak hours
-   Contact administrator about server performance

### Browser Compatibility

**Supported Browsers**:

-   Chrome (latest 2 versions)
-   Firefox (latest 2 versions)
-   Safari (latest 2 versions)
-   Edge (latest 2 versions)

**Minimum Requirements**:

-   JavaScript enabled
-   Cookies enabled
-   Modern browser (released within last 3 years)

### Error Messages

#### "Article not found"

-   The article may have been removed from the database
-   Check the article ID/URL is correct
-   Try searching for the article again

#### "User not authenticated"

-   You need to log in to access this feature
-   Your session may have expired
-   Log in again to continue

#### "Article already bookmarked"

-   You've already saved this article
-   Check your bookmarks page to confirm
-   Try refreshing to see updated bookmark status

---

## FAQ

### General Questions

**Q: Is ArticleDesk free to use?**
A: Yes, ArticleDesk is completely free to use. You just need to create an account to access bookmark features.

**Q: How often are new articles added?**
A: Articles are automatically fetched and added to the database on a regular schedule (typically daily) using the integrated news feed system.

**Q: Can I access ArticleDesk on my mobile device?**
A: Yes! ArticleDesk is fully responsive and works on smartphones, tablets, and desktop computers.

**Q: How many articles can I bookmark?**
A: There's no limit to the number of articles you can bookmark. Save as many as you like!

### Account & Security

**Q: Is my personal information secure?**
A: Yes, ArticleDesk uses industry-standard security practices including password hashing and secure session management.

**Q: Can I change my email address?**
A: Currently, email changes must be handled by an administrator. Contact support for assistance.

**Q: What happens if I forget my password?**
A: Contact the administrator to reset your password. Password reset functionality may be added in future versions.

**Q: Can I delete my account?**
A: Account deletion requests should be directed to the administrator.

### Features & Functionality

**Q: Can I organize my bookmarks into folders?**
A: Currently, bookmarks are displayed in chronological order. Folder organization may be added in future updates.

**Q: Can I share articles with other users?**
A: You can share article links directly from the original news source. Social sharing features may be added in future versions.

**Q: Are there any article reading limits?**
A: No, you can read as many articles as you want. However, clicking through to read full articles takes you to the original news source.

**Q: Can I search within my bookmarks?**
A: Currently, you can browse your bookmarks chronologically. Bookmark search functionality may be added in future updates.

### Technical Questions

**Q: Why do some articles not have images?**
A: Not all news articles include featured images. ArticleDesk displays images when they're available from the news source.

**Q: Can I export my bookmarks?**
A: Export functionality isn't currently available but may be added in future versions.

**Q: Does ArticleDesk work offline?**
A: ArticleDesk requires an internet connection to function, as it fetches live data and syncs your bookmarks.

**Q: What news sources are included?**
A: ArticleDesk aggregates articles from various reputable news sources. You can see available sources using the search filters.

### Support & Contact

**Q: How do I report a bug or issue?**
A: Contact the administrator or development team with details about the issue you're experiencing.

**Q: Can I suggest new features?**
A: Yes! Feature suggestions are welcome. Contact the development team with your ideas.

**Q: Is there a mobile app version?**
A: Currently, ArticleDesk is a web application. A dedicated mobile app may be developed in the future.

---

## Conclusion

ArticleDesk provides a powerful and user-friendly platform for discovering, reading, and saving news articles. With its comprehensive search capabilities, bookmark management, and responsive design, it's an excellent tool for staying informed and organizing your reading material.

For additional support or questions not covered in this manual, please contact the system administrator or development team.

---

_Last updated: [Current Date]_  
_Version: 1.0.0_
