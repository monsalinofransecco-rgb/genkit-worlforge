'use server';

/**
 * @fileOverview Generates a culturally-aware, unique character name based on a race's naming profile.
 *
 * - generateCharacterName - The main function to generate a name.
 * - GenerateCharacterNameInput - The input schema for the flow.
 * - GenerateCharacterNameOutput - The output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const NamingProfileSchema = z.object({
  phonemes: z.string(),
  inspiration: z.string(),
  languageStructure: z.string(),
});

const GenerateCharacterNameInputSchema = z.object({
  namingProfile: NamingProfileSchema.describe("The linguistic and cultural rules for the race's names."),
  existingNames: z.array(z.string()).describe('A list of names already in use that cannot be repeated.'),
});
export type GenerateCharacterNameInput = z.infer<typeof GenerateCharacterNameInputSchema>;

const GenerateCharacterNameOutputSchema = z.object({
  name: z.string().describe('The newly generated, unique name.'),
  explanation: z.string().describe('A brief, 1-sentence explanation for why the name fits the cultural profile.'),
});
export type GenerateCharacterNameOutput = z.infer<typeof GenerateCharacterNameOutputSchema>;

export async function generateCharacterName(
  input: GenerateCharacterNameInput
): Promise<GenerateCharacterNameOutput> {
  return generateCharacterNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterNamePrompt',
  input: {schema: GenerateCharacterNameInputSchema},
  output: {schema: GenerateCharacterNameOutputSchema},
  prompt: `
    You are a master world-builder and etymologist. Your task is to invent a new,
    unique character name for a world simulation based on a specific cultural profile.

    The name must follow these specific linguistic and cultural rules:
    - Inspiration: {{namingProfile.inspiration}}
    - Phonemes (sounds): {{namingProfile.phonemes}}
    - Language Structure: {{namingProfile.languageStructure}}

    The name must be creative and sound authentic to this culture.
    It must NOT be a generic fantasy name (e.g., 'Legolas', 'Gimli').
    
    Most importantly, the name must be UNIQUE.
    It CANNOT be any of the following names already in use:
    [{{#each existingNames}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}]

    Your task is to return a single, unique name and a brief explanation for it.
  `,
});

const generateCharacterNameFlow = ai.defineFlow(
  {
    name: 'generateCharacterNameFlow',
    inputSchema: GenerateCharacterNameInputSchema,
    outputSchema: GenerateCharacterNameOutputSchema,
  },
  async (input) => {
    // The AI is good, but we can loop to be certain of uniqueness.
    for (let i = 0; i < 3; i++) {
      const {output} = await prompt(input);
      if (output && !input.existingNames.includes(output.name)) {
        return output; // Found a unique name
      }
    }
    // If we fail after 3 tries, we can either throw or return a fallback.
    throw new Error('Failed to generate a unique name after 3 attempts.');
  }
);
