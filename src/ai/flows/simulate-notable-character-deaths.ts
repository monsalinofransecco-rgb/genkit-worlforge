'use server';
/**
 * @fileOverview Simulates deaths of notable characters and generates commoner deaths for emotional impact.
 *
 * - simulateNotableCharacterDeaths - A function that simulates character deaths and their impact.
 * - SimulateNotableCharacterDeathsInput - The input type for the simulateNotableCharacterDeaths function.
 * - SimulateNotableCharacterDeathsOutput - The return type for the simulateNotableCharacterDeaths function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateNotableCharacterDeathsInputSchema = z.object({
  notableCharacterNames: z
    .array(z.string())
    .describe('Array of names of notable characters.'),
  reasonForDeaths: z.string().describe('The reason for the deaths.'),
  currentYear: z.number().describe('The current year in the simulation.'),
  raceName: z.string().describe('Name of the dominant race.'),
});
export type SimulateNotableCharacterDeathsInput = z.infer<
  typeof SimulateNotableCharacterDeathsInputSchema
>;

const SimulateNotableCharacterDeathsOutputSchema = z.object({
  deathNarratives: z
    .array(z.string())
    .describe('Narratives describing the deaths of notable characters.'),
  commonerDeathToll: z
    .number()
    .describe('Number of commoners who died as a result.'),
  impactfulQuote: z.string().describe('A quote reflecting on the deaths.'),
});
export type SimulateNotableCharacterDeathsOutput = z.infer<
  typeof SimulateNotableCharacterDeathsOutputSchema
>;

export async function simulateNotableCharacterDeaths(
  input: SimulateNotableCharacterDeathsInput
): Promise<SimulateNotableCharacterDeathsOutput> {
  return simulateNotableCharacterDeathsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateNotableCharacterDeathsPrompt',
  input: {schema: SimulateNotableCharacterDeathsInputSchema},
  output: {schema: SimulateNotableCharacterDeathsOutputSchema},
  prompt: `You are a storyteller, chronicling the history of the {{raceName}} people.

The following notable characters have died: {{notableCharacterNames}}.
The reason for their deaths is: {{reasonForDeaths}}.
The current year is {{currentYear}}.

Generate narratives for each character's death, focusing on the impact
on the {{raceName}} people. Also, generate an appropriate commoner death toll
that emphasizes the emotional impact of these deaths. Finally, create an impactful quote to remember these fallen people.

Character Death Narratives:
{{#each notableCharacterNames}}
- Death of {{this}}:
{{/each}}

Commoner Death Toll: (A number reflecting the magnitude of deaths among commoners)
Impactful Quote: (A memorable quote that encapsulates the tragedy)

Output the result into a JSON object`,
});

const simulateNotableCharacterDeathsFlow = ai.defineFlow(
  {
    name: 'simulateNotableCharacterDeathsFlow',
    inputSchema: SimulateNotableCharacterDeathsInputSchema,
    outputSchema: SimulateNotableCharacterDeathsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
