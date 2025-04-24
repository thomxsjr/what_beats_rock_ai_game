import { createClient } from 'redis';

let redisClient;

export async function setupCache() {
  try {
    // Connect to Redis
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    
    redisClient.on('error', (err) => console.log('Redis error:', err));
    
    await redisClient.connect();
    console.log('Connected to Redis');
    
    // Return cache interface
    return {
      // Set cache with optional expiry in seconds
      set: async (key, value, exType = 'EX', expiry = 3600) => {
        await redisClient.set(key, JSON.stringify(value), {
          [exType]: expiry
        });
      },
      
      // Get from cache
      get: async (key) => {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
      },
      
      // Clear cache 
      clear: async () => {
        await redisClient.flushAll();
      },
      
      // Close connection
      close: async () => {
        await redisClient.quit();
      }
    };
  } catch (error) {
    console.error('Redis connection error:', error);
    
    // Fallback to in-memory cache if Redis connection fails
    console.log('Falling back to in-memory cache');
    const memoryCache = new Map();
    
    return {
      set: async (key, value) => {
        memoryCache.set(key, value);
      },
      get: async (key) => {
        return memoryCache.get(key) || null;
      },
      clear: async () => {
        memoryCache.clear();
      },
      close: async () => {
        // Nothing to do for in-memory cache
      }
    };
  }
}