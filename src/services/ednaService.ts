/**
 * Service for interacting with the eDNA Sequence Matcher API
 * Handles eDNA sequence matching and species identification
 */

const EDNA_API_BASE_URL = process.env.REACT_APP_EDNA_API_URL || 'https://sagar-e-dna.vercel.app';

export interface EDNAMatchRequest {
  sequence: string;
}

export interface EDNAMatchResponse {
  identifier: string;
  species_name: string;
  confidence_score: number;
  raw_score: number;
}

export interface EDNAErrorResponse {
  detail?: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
  message?: string;
}

export class EDNAService {
  private static instance: EDNAService;

  private constructor() {}

  public static getInstance(): EDNAService {
    if (!EDNAService.instance) {
      EDNAService.instance = new EDNAService();
    }
    return EDNAService.instance;
  }

  /**
   * Match eDNA sequence to identify species
   * @param sequence - DNA sequence string (without FASTA header)
   * @returns Match result with species identification
   */
  async matchSequence(sequence: string): Promise<EDNAMatchResponse> {
    try {
      // Clean the sequence - remove whitespace and ensure uppercase
      const cleanSequence = sequence.trim().toUpperCase().replace(/\s+/g, '');

      if (!cleanSequence) {
        throw new Error('Sequence cannot be empty');
      }

      // Validate sequence contains only valid DNA characters
      if (!/^[ACGTN]+$/i.test(cleanSequence)) {
        throw new Error('Invalid DNA sequence. Sequence must contain only A, C, G, T, or N characters.');
      }

      const response = await fetch(`${EDNA_API_BASE_URL}/api/v1/edna/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: cleanSequence }),
      });

      // Read response once
      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      // Check for errors
      if (!response.ok) {
        const errorMsg = data?.detail || data?.message || JSON.stringify(data) || response.statusText;
        throw new Error(`API request failed (${response.status}): ${errorMsg}`);
      }

      // Validate response structure
      if (!data.species_name && !data.identifier) {
        throw new Error('Invalid API response format');
      }

      return data as EDNAMatchResponse;
    } catch (error: any) {
      console.error('eDNA API match failed:', error);
      throw error;
    }
  }
}

export default EDNAService.getInstance();

