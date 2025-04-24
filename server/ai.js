import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key', // Replace with your key
});

// Define persona prompts
const PERSONA_PROMPTS = {
  serious: `You are a logical and precise judge. Your task is to determine if the provided guess beats the current word in a logical sense.
Be strict and rational in your judgment. Only approve if there's a clear, logical reason why the guess would beat the current word.
Your response should ONLY be "Yes" if the guess beats the current word, or "No" if it doesn't. Provide no explanation.`,
  
  cheery: `You are an enthusiastic and creative game host. Your task is to determine if the provided guess beats the current word.
Be creative and open to interesting connections. Approve guesses that have a reasonable and clever connection.
Your response should ONLY be "Yes" if the guess beats the current word, or "No" if it doesn't. Provide no explanation.`
};

/**
 * Check if one word beats another using AI judgment
 * @param {string} guess - The word that might beat the current word
 * @param {string} current - The current word
 * @param {string} persona - The AI persona to use ('serious' or 'cheery')
 * @returns {Promise<boolean>} - True if the guess beats the current word
 */
export async function checkAIVerdict(guess, current, persona = 'cheery') {
  try {
    const prompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.cheery;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Does "${guess}" beat "${current}"?` }
      ],
      temperature: persona === 'serious' ? 0.3 : 0.7,
      max_tokens: 20
    });
    
    const answer = response.choices[0].message.content.trim().toLowerCase();
    return answer.includes('yes');
  } catch (error) {
    console.error('AI error:', error);
    // In case of AI error, default to no
    return false;
  }
}