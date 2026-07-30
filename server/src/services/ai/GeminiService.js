import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-1.5-flash';

/**
 * GeminiService — low-level wrapper for Google Gen AI SDK.
 * Handles text generation, structured JSON, logging, and error tracing.
 */
class GeminiService {
  constructor() {
    this.ai = null;
    this.initializedKey = null;
  }

  /**
   * Lazily initialize or retrieve GoogleGenAI client instance
   */
  getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[GeminiService] ⚠️ GEMINI_API_KEY is missing or contains placeholder value in process.env.');
      return null;
    }

    if (!this.ai || this.initializedKey !== apiKey) {
      console.log(`[GeminiService] 🔑 Initializing GoogleGenAI client with key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.initializedKey = apiKey;
      } catch (err) {
        console.error('[GeminiService] ❌ Failed to instantiate GoogleGenAI:', err.message);
        return null;
      }
    }

    return this.ai;
  }

  /**
   * Generate plain text from a prompt using Gemini.
   *
   * @param {string} prompt - The user prompt text
   * @param {string} [systemInstruction] - Optional system instruction
   * @returns {Promise<{ text: string, usage: object, model: string }>}
   */
  async generateText(prompt, systemInstruction = '') {
    const client = this.getAiClient();

    if (!client) {
      console.warn('[GeminiService] ⚠️ Client unavailable. Returning fallback text response.');
      return this._fallbackText(prompt, systemInstruction, 'GEMINI_API_KEY missing or invalid in environment');
    }

    const modelId = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    console.log(`[GeminiService] 🚀 Sending request to Gemini API (model: ${modelId})...`);
    console.log(`[GeminiService] 📥 Prompt Preview: "${prompt.slice(0, 120).replace(/\n/g, ' ')}..."`);

    try {
      const response = await client.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are Nexora AI — an intelligent project management assistant. Be concise, actionable, and professional.',
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      const text = response.text || '';
      const usage = response.usageMetadata || {};

      console.log(`[GeminiService] ✅ Response received from Gemini API (${text.length} chars).`);
      console.log(`[GeminiService] 📤 Response Preview: "${text.slice(0, 120).replace(/\n/g, ' ')}..."`);

      return {
        text,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        model: modelId,
      };
    } catch (err) {
      console.error(`[GeminiService] ❌ Gemini API Error (${err.name || 'Error'}):`, err.message);
      if (err.stack) console.error(err.stack);

      return this._fallbackText(prompt, systemInstruction, err.message);
    }
  }

  /**
   * Generate a structured JSON response from a prompt.
   *
   * @param {string} prompt - The user prompt
   * @param {string} [systemInstruction] - Optional system instruction
   * @returns {Promise<{ data: object|null, text: string, usage: object, model: string }>}
   */
  async generateStructuredJson(prompt, systemInstruction = '') {
    const client = this.getAiClient();

    if (!client) {
      console.warn('[GeminiService] ⚠️ Client unavailable for JSON generation.');
      return { data: null, text: '', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, model: 'fallback' };
    }

    const modelId = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    console.log(`[GeminiService] 🚀 Sending JSON request to Gemini API (model: ${modelId})...`);

    try {
      const response = await client.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are Nexora AI. Return your response as valid JSON only. No markdown fences.',
          responseMimeType: 'application/json',
          temperature: 0.5,
          maxOutputTokens: 2048,
        },
      });

      const text = response.text || '';
      const usage = response.usageMetadata || {};

      let data = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('[GeminiService] ⚠️ JSON parse error on response:', parseErr.message);
        data = null;
      }

      console.log(`[GeminiService] ✅ JSON response received & parsed successfully.`);

      return {
        data,
        text,
        usage: {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        model: modelId,
      };
    } catch (err) {
      console.error(`[GeminiService] ❌ Gemini JSON API Error:`, err.message);
      if (err.stack) console.error(err.stack);
      return { data: null, text: '', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }, model: 'fallback' };
    }
  }

  /**
   * Fallback text generator when Gemini API is not available or throws error.
   */
  _fallbackText(prompt, systemInstruction, error = '') {
    const cleanPrompt = prompt.split('\n\n').pop()?.replace(/^User:\s*/i, '') || prompt;
    const fallback = `I'm **Nexora AI** — your intelligent project management assistant.\n\n` +
      `I received your request: *"${cleanPrompt.slice(0, 150)}"*.\n\n` +
      `> 💡 To connect live Gemini AI capabilities, set a valid \`GEMINI_API_KEY\` in your server \`.env\` file.\n\n` +
      (error ? `_Technical detail: ${error}_` : '');

    return {
      text: fallback,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'heuristic_fallback',
    };
  }
}

export default new GeminiService();
