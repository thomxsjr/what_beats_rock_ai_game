import Filter from 'bad-words';
import OpenAI from 'openai';

// Initialize profanity filter
const filter = new Filter();

// Initialize OpenAI for moderation API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key', // Replace with your key
});

/**
 * Check if content is appropriate using both local filter and OpenAI moderation
 * @param {string} content - The text to moderate
 * @returns {Promise<boolean>} - True if content is clean
 */
export async function moderateContent(content) {
  try {
    // First check with local filter (faster)
    if (filter.isProfane(content)) {
      return false;
    }
    
    // Then use OpenAI's moderation API (more thorough)
    const result = await openai.moderations.create({
      input: content,
    });
    
    // Return true if content is flagged as safe
    return !result.results[0].flagged;
  } catch (error) {
    console.error('Moderation error:', error);
    // If moderation fails, default to allowing non-obvious profanity
    // but still block content caught by our local filter
    return !filter.isProfane(content);
  }
}