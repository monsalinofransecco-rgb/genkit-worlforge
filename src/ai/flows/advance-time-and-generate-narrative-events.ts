'use server';

/**
 * @fileOverview Advances time in the simulation and generates narrative events.
 *
 * - advanceTimeAndGenerateNarrativeEvents - A function that advances time and generates narrative events.
 * - AdvanceTimeAndGenerateNarrativeEventsInput - The input type for the advanceTimeAndGenerateNarrativeEvents function.
 * - AdvanceTimeAndGenerateNarrativeEventsOutput - The return type for the advanceTimeAndGenerateNarrativeEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvanceTimeAndGenerateNarrativeEventsInputSchema = z.object({
  years: z.number().describe('The number of years to advance time by (1 or 10).'),
  worldName: z.string().describe('The name of the world.'),
  currentYear: z.number().describe('The current year in the world.'),
  raceCount: z.number().describe('The current number of races in the world.'),
  population: z.number().describe('The current population in the world.'),
  significantEvents: z.string().describe('A summary of significant events that have occurred in the world.'),
  boons: z.string().describe('A summary of active boons affecting the world.'),
  cataclysmPreparations: z.string().describe('A summary of preparations for potential cataclysm events.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsInput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsInputSchema>;

const AdvanceTimeAndGenerateNarrativeEventsOutputSchema = z.object({
  narrativeEvents: z.string().describe('A description of narrative events that occurred during the time period.'),
  populationChanges: z.string().describe('A description of population changes that occurred during the time period.'),
  characterLifecycleUpdates: z.string().describe('A description of character lifecycle updates that occurred during the time period.'),
  problemSimulations: z.string().describe('A description of problem simulations that occurred during the time period.'),
  societalEvolutions: z.string().describe('A description of societal evolutions that occurred during the time period.'),
  geographicalDiscoveries: z.string().describe('A description of geographical discoveries that occurred during the time period.'),
  newYear: z.number().describe('The new current year in the world.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsOutput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsOutputSchema>;

export async function advanceTimeAndGenerateNarrativeEvents(input: AdvanceTimeAndGenerateNarrativeEventsInput): Promise<AdvanceTimeAndGenerateNarrativeEventsOutput> {
  return advanceTimeAndGenerateNarrativeEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advanceTimeAndGenerateNarrativeEventsPrompt',
  input: {schema: AdvanceTimeAndGenerateNarrativeEventsInputSchema},
  output: {schema: AdvanceTimeAndGenerateNarrativeEventsOutputSchema},
  prompt: `You are a world simulator. You are simulating the world of {{{worldName}}}.

The current year is {{{currentYear}}}.
The number of races in the world is {{{raceCount}}}.
The current population is {{{population}}}.

Significant events that have occurred in the world:
{{{significantEvents}}}

Active boons affecting the world:
{{{boons}}}

Preparations for potential cataclysm events:
{{{cataclysmPreparations}}}

Advance time by {{{years}}} years and generate narrative events, population changes, character lifecycle updates, problem simulations, societal evolution, and geographical discoveries that occurred during the time period.

Output the new year, narrative events, population changes, character lifecycle updates, problem simulations, societal evolution, and geographical discoveries in the appropriate output fields.
`,
});

const advanceTimeAndGenerateNarrativeEventsFlow = ai.defineFlow(
  {
    name: 'advanceTimeAndGenerateNarrativeEventsFlow',
    inputSchema: AdvanceTimeAndGenerateNarrativeEventsInputSchema,
    outputSchema: AdvanceTimeAndGenerateNarrativeEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt({...input, newYear: input.currentYear + input.years});
    return output!;
  }
);
