'use server';

/**
 * @fileOverview Generates a naming profile for a new race, including phonemes, inspiration, and language structure.
 *
 * - generateRaceNamingProfile - A function that generates the naming profile.
 * - GenerateRaceNamingProfileInput - The input type for the generateRaceNamingProfile function.
 * - GenerateRaceNamingProfileOutput - The return type for the generateRaceNamingProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRaceNamingProfileInputSchema = z.object({
  raceName: z.string().describe('The name of the race.'),
});
export type GenerateRaceNamingProfileInput = z.infer<
  typeof GenerateRaceNamingProfileInputSchema
>;

const GenerateRaceNamingProfileOutputSchema = z.object({
  phonemes: z
    .string()
    .describe(
      'A list of phonemes (basic units of sound) that are characteristic of the race name.'
    ),
  inspiration: z
    .string()
    .describe(
      'The cultural or linguistic inspiration for the race names (e.g., Celtic, Norse, etc.).'
    ),
  languageStructure: z
    .string()
    .describe(
      'The basic structure of the language, such as whether it is agglutinative, fusional, etc.'
    ),
});
export type GenerateRaceNamingProfileOutput = z.infer<
  typeof GenerateRaceNamingProfileOutputSchema
>;

export async function generateRaceNamingProfile(
  input: GenerateRaceNamingProfileInput
): Promise<GenerateRaceNamingProfileOutput> {
  return generateRaceNamingProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRaceNamingProfilePrompt',
  input: {schema: GenerateRaceNamingProfileInputSchema},
  output: {schema: GenerateRaceNamingProfileOutputSchema},
  prompt: `You are a world-building expert, skilled in creating unique and thematic naming profiles for fictional races in fantasy settings.

  Generate a naming profile for the race: {{raceName}}. The profile should include the following:

  - phonemes: A representative set of phonemes common to names in the culture.
  - inspiration: The cultural or linguistic inspiration for the race names (e.g., Celtic, Norse, etc.).
  - languageStructure: The basic structure of the language, such as whether it is agglutinative, fusional, etc.

  Ensure that the naming profile is thematically appropriate for the race.
  `,
});

const generateRaceNamingProfileFlow = ai.defineFlow(
  {
    name: 'generateRaceNamingProfileFlow',
    inputSchema: GenerateRaceNamingProfileInputSchema,
    outputSchema: GenerateRaceNamingProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
