/**
 * Service for interacting with Google Gemini API
 * Handles species summary generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private constructor() {
    if (GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
      }
    }
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Get a short summary about a species
   * @param scientificName - Scientific name of the species
   * @param rank - Taxonomic rank
   * @param lineage - Taxonomic lineage information
   * @returns Short summary about the species
   */
  async getSpeciesSummary(
    scientificName: string,
    rank?: string,
    lineage?: Array<{ rank: string; name: string }>
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.');
    }

    try {
      const lineageText = lineage && lineage.length > 0
        ? `Taxonomic classification: ${lineage.map(l => `${l.rank}: ${l.name}`).join(', ')}`
        : '';

      const prompt = `Provide a brief, concise summary (2-3 sentences maximum) about the species "${scientificName}"${rank ? ` (${rank})` : ''}.

${lineageText ? `${lineageText}\n\n` : ''}
Focus on:
- First appearance/discovery (when and by whom, if notable)
- Key characteristics or notable facts
- Brief ecological or biological significance

Keep it short and informative. Do not include markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text() || 'No summary available.';

      // Clean up any markdown that might be in the response
      return summary.trim().replace(/^```[\s\S]*?```$/gm, '').trim();
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(error.message || 'Failed to get species summary from Gemini');
    }
  }
}

export default GeminiService.getInstance();
