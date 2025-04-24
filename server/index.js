import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { setupDatabase } from './database.js';
import { setupCache } from './cache.js';
import { moderateContent } from './moderation.js';
import { checkAIVerdict } from './ai.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5173", process.env.VITE_API_URL || 'http://localhost:3000'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', process.env.VITE_API_URL || 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Persona'],
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));

// Set up rate limiting - 100 requests per IP per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Game sessions (in-memory for simplicity - would be in DB in production)
const gameSessions = new Map();

// Initialize DB and Redis
let db, cache;

// Initialize linked list for a game session
function createGameSession(sessionId) {
  return {
    id: sessionId,
    guesses: ['Rock'], // Start with Rock as the first word
    visitedWords: new Set(['rock']), // Track already used words (lowercase for case-insensitive comparison)
  };
}

// Main guess endpoint
app.post('/api/guess', async (req, res) => {
  try {
    const { guess, current } = req.body;
    const persona = req.headers['x-persona'] || 'cheery';
    
    // Get or create session (using IP as session ID for demo)
    const sessionId = req.ip;
    if (!gameSessions.has(sessionId)) {
      gameSessions.set(sessionId, createGameSession(sessionId));
    }
    
    const session = gameSessions.get(sessionId);
    
    // Validate input
    if (!guess || !current) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    // Normalize to lowercase for checking
    const normalizedGuess = guess.toLowerCase();
    
    // Check if word has already been used in this session
    if (session.visitedWords.has(normalizedGuess)) {
      return res.status(400).json({ 
        success: false, 
        error: 'duplicate_guess', 
        message: `Game Over! "${guess}" has already been guessed.` 
      });
    }
    
    // Moderate content
    const isClean = await moderateContent(guess);
    if (!isClean) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please keep your guesses appropriate.' 
      });
    }
    
    // Check cache first for the verdict
    const cacheKey = `${normalizedGuess}:${current.toLowerCase()}`;
    let verdict = await cache.get(cacheKey);
    
    // If not in cache, ask the AI
    if (verdict === null) {
      verdict = await checkAIVerdict(guess, current, persona);
      // Cache the result (expires in 24 hours)
      await cache.set(cacheKey, verdict, 'EX', 86400);
    } else {
      console.log(`Cache hit for: ${cacheKey}`);
    }
    
    if (verdict) {
      // It's a valid guess - add to the session
      session.guesses.push(guess);
      session.visitedWords.add(normalizedGuess);
      
      // Update global count for this guess
      const globalCount = await db.incrementGuessCount(guess);
      
      return res.json({ 
        success: true, 
        message: `Nice! "${guess}" beats "${current}".`,
        globalCount
      });
    } else {
      return res.json({ 
        success: false, 
        message: `"${guess}" doesn't beat "${current}". Try again!` 
      });
    }
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get guess history for the current session
app.get('/api/history', (req, res) => {
  const sessionId = req.ip;
  if (!gameSessions.has(sessionId)) {
    return res.json({ guesses: [] });
  }
  
  const session = gameSessions.get(sessionId);
  res.json({ guesses: session.guesses });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
async function startServer() {
  try {
    // Initialize database and cache
    db = await setupDatabase();
    cache = await setupCache();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();