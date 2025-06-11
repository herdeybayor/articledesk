#!/bin/bash

# ArticleDesk - Local Development Setup Script
# This script automates the setup process for local development

# Color codes for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print the logo
echo -e "${BLUE}"
echo "    _         _   _      _     _____            _    "
echo "   / \   _ __| |_(_) ___| | __|  _ \  ___  ___| | __"
echo "  / _ \ | '__| __| |/ __| |/ /| | | |/ _ \/ __| |/ /"
echo " / ___ \| |  | |_| | (__|   < | |_| |  __/\__ \   < "
echo "/_/   \_\_|   \__|_|\___|_|\_\____/ \___||___/_|\_\\"
echo -e "${NC}"
echo -e "${GREEN}Local Development Setup Script${NC}\n"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check for Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "✅ Node.js is installed: ${GREEN}$NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v14 or higher.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check for npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "✅ npm is installed: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies. Please check the errors above.${NC}"
    exit 1
fi
echo -e "✅ Dependencies installed successfully."

echo -e "\n${YELLOW}Step 3: Setting up environment...${NC}"
if [ -f .env ]; then
    echo -e "${YELLOW}ℹ️ .env file already exists.${NC}"
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE_ENV
    if [[ $OVERWRITE_ENV == "y" || $OVERWRITE_ENV == "Y" ]]; then
        cp .env.example .env
        echo -e "✅ Created new .env file from example."
    else
        echo -e "ℹ️ Using existing .env file."
    fi
else
    cp .env.example .env
    echo -e "✅ Created .env file from example."
fi

echo -e "${YELLOW}ℹ️ Please edit the .env file to add your NewsAPI key and other required values.${NC}"
read -p "Press Enter to continue after editing your .env file, or 'skip' to continue without editing: " CONTINUE
if [[ $CONTINUE != "skip" ]]; then
    if command_exists nano; then
        nano .env
    elif command_exists vim; then
        vim .env
    elif command_exists code; then
        code .env
    else
        echo -e "${YELLOW}ℹ️ No editor found. Please edit the .env file manually before continuing.${NC}"
        read -p "Press Enter to continue after editing your .env file: " CONTINUE
    fi
fi

echo -e "\n${YELLOW}Step 4: Setting up database...${NC}"
echo -e "ℹ️ Generating database schema..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate database schema. Please check the errors above.${NC}"
    exit 1
fi

echo -e "ℹ️ Running migrations..."
npm run db:migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to run migrations. Please check the errors above.${NC}"
    exit 1
fi
echo -e "✅ Database setup completed successfully."

echo -e "\n${YELLOW}Step 5: Fetching initial articles...${NC}"
npm run fetch:articles
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to fetch initial articles. Please check if your NewsAPI key is correct.${NC}"
    echo -e "${YELLOW}ℹ️ You can still continue, but the application will not have any initial data.${NC}"
else
    echo -e "✅ Initial articles fetched successfully."
fi

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "\nTo start the development server:"
echo -e "  ${BLUE}npm run dev${NC}"
echo -e "\nTo run the cron job for scheduled article fetching:"
echo -e "  ${BLUE}npm run cron:start${NC}"
echo -e "\nTo run both at the same time:"
echo -e "  ${BLUE}npm run start:all${NC}"
echo -e "\nView your application at: ${BLUE}http://localhost:3000${NC}"
echo -e "\n${YELLOW}Happy coding!${NC} 🚀" 