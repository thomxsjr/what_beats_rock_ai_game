import pg from 'pg';
const { Pool } = pg;

// Database connection
let pool;

export async function setupDatabase() {
  try {
    // Create pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Connection pooling - handle up to 20 concurrent connections
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS guess_counts (
        word TEXT PRIMARY KEY,
        count INTEGER DEFAULT 1
      );
    `);
    
    client.release();
    
    // Return database interface
    return {
      // Increment count for a guess and return new count
      incrementGuessCount: async (word) => {
        const result = await pool.query(
          `INSERT INTO guess_counts (word, count)
           VALUES ($1, 1)
           ON CONFLICT (word)
           DO UPDATE SET count = guess_counts.count + 1
           RETURNING count;`,
          [word]
        );
        return result.rows[0].count;
      },
      
      // Get global count for a word
      getGuessCount: async (word) => {
        const result = await pool.query(
          'SELECT count FROM guess_counts WHERE word = $1',
          [word]
        );
        return result.rows.length > 0 ? result.rows[0].count : 0;
      },
      
      // Get all word counts (for analytics)
      getAllGuessCountsOrdered: async (limit = 100) => {
        const result = await pool.query(
          'SELECT word, count FROM guess_counts ORDER BY count DESC LIMIT $1',
          [limit]
        );
        return result.rows;
      },
      
      // Close the pool
      close: async () => {
        await pool.end();
      }
    };
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}