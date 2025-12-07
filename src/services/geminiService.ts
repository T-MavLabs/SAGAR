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
   * Check if a query is relevant to marine research and oceanography
   * @param query - User query to check
   * @returns Object with isRelevant boolean and reason if not relevant
   */
  async checkQueryRelevance(query: string): Promise<{ isRelevant: boolean; reason?: string }> {
    if (!this.model) {
      // If Gemini is not configured, allow the query to proceed (fallback behavior)
      console.warn('Gemini API key not configured. Skipping relevance check.');
      return { isRelevant: true };
    }

    try {
      const prompt = `Analyze the following query and determine if it is relevant to marine research, oceanography, marine biology, or marine data analysis.

Query: "${query}"

This project focuses on:
- Marine species identification and biodiversity
- Oceanographic data (CTD, AWS, ADCP)
- Marine occurrence records
- Species distribution and ecology
- Ocean currents, temperature, salinity
- Marine research data analysis

Respond with ONLY a JSON object in this exact format:
{
  "isRelevant": true or false,
  "reason": "brief explanation if not relevant, or empty string if relevant"
}

Examples of RELEVANT queries:
- "What species are found in the Arabian Sea?"
- "Show CTD temperature profiles"
- "Current speeds in Indian Ocean"
- "Species at depth 300-500 meters"
- "Marine biodiversity in Bay of Bengal"

Examples of IRRELEVANT queries:
- "What is the weather today?"
- "How to cook pasta?"
- "Football match results"
- "Stock market prices"
- "Movie recommendations"

Return ONLY the JSON object, no other text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text() || '{"isRelevant": true}';

      // Extract JSON from response (handle markdown code blocks if present)
      let jsonText = text.trim();
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      
      try {
        const parsed = JSON.parse(jsonText);
        return {
          isRelevant: parsed.isRelevant === true,
          reason: parsed.reason || undefined
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini relevance response:', parseError, 'Response:', text);
        // If parsing fails, default to allowing the query (fail open)
        return { isRelevant: true };
      }
    } catch (error: any) {
      console.error('Gemini relevance check error:', error);
      // If API fails, allow the query to proceed (fail open)
      return { isRelevant: true };
    }
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
