# What Beats Rock Game

A minimum-viable clone of the "What Beats Rock" concept that demonstrates AI integration, backend architecture, and efficient data structures.

## Features

- AI-powered judgment system to determine if one item "beats" another
- Linked list data structure to track game progression
- Caching layer to prevent duplicate LLM calls
- Global guess counter for each answer
- Player session management with guess history
- Content moderation for input filtering
- Multiple host personas (Serious/Cheery)
- One-click Docker deployment with API, DB, and Redis

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI Provider**: OpenAI
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 16+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key

### Environment Setup

1. Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

### Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run start
```

This will start both the frontend and backend servers concurrently.

### Docker Deployment

To deploy using Docker Compose:

```bash
docker-compose up -d
```

This will build and start the application, PostgreSQL database, and Redis cache.

## Project Structure

- `/src` - Frontend React application
- `/server` - Node.js backend
  - `index.js` - Main Express server
  - `database.js` - PostgreSQL database connection and queries
  - `cache.js` - Redis cache setup and interface
  - `ai.js` - OpenAI integration for verdict determination
  - `moderation.js` - Content moderation
- `/tests` - End-to-end tests

## How the Game Works

1. A round starts with a seed word (e.g., "Rock")
2. Users type something they think "beats" it
3. The guess is forwarded to the LLM to determine if it beats the current word
4. If yes, the word is added to the linked list and the player continues
5. If the word has been guessed before, the game is over
6. The goal is to build the longest possible chain of words

## License

MIT