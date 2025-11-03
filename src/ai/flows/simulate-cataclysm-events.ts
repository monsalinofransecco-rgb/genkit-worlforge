'use server';

/**
 * @fileOverview Simulates cataclysm events (flood, volcano, blight) with varying outcomes based on the race's preparations.
 *
 * - simulateCataclysmEvent - A function that handles the cataclysm event simulation.
 * - SimulateCataclysmEventInput - The input type for the simulateCataclysmEvent function.
 * - SimulateCataclysmEventOutput - The return type for the simulateCataclysmEvent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateCataclysmEventInputSchema = z.object({
  worldName: z.string().describe('The name of the world where the cataclysm occurs.'),
  raceName: z.string().describe('The name of the race affected by the cataclysm.'),
  cataclysmType: z
    .enum(['flood', 'volcano', 'blight'])
    .describe('The type of cataclysm event.'),
  preparationLevel: z
    .number()
    .int()
    .min(0)
    .max(10)
    .describe('The level of preparation the race has for the cataclysm (0-10).'),
});
export type SimulateCataclysmEventInput = z.infer<typeof SimulateCataclysmEventInputSchema>;

const SimulateCataclysmEventOutputSchema = z.object({
  eventDescription: z
    .string()
    .describe('A detailed description of the cataclysm event and its immediate impact.'),
  outcomeDescription: z
    .string()
    .describe('A description of the long-term outcome for the race, considering their preparation level.'),
  raceSurvivalRate: z
    .number()
    .min(0)
    .max(1)
    .describe('The estimated survival rate of the race after the cataclysm (0-1).'),
  infrastructureDamage: z
    .number()
    .min(0)
    .max(1)
    .describe('The estimated damage to the race infrastructure after the cataclysm (0-1).'),
});
export type SimulateCataclysmEventOutput = z.infer<typeof SimulateCataclysmEventOutputSchema>;

export async function simulateCataclysmEvent(
  input: SimulateCataclysmEventInput
): Promise<SimulateCataclysmEventOutput> {
  return simulateCataclysmEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateCataclysmEventPrompt',
  input: {schema: SimulateCataclysmEventInputSchema},
  output: {schema: SimulateCataclysmEventOutputSchema},
  prompt: `You are a world simulator detailing cataclysmic events for a given race.

  World Name: {{worldName}}
  Race Name: {{raceName}}
  Cataclysm Type: {{cataclysmType}}
  Preparation Level: {{preparationLevel}}

  Describe the cataclysm event, its immediate impact, and the long-term outcome for the race, considering their preparation level.
  Also, estimate the race survival rate (0-1) and infrastructure damage (0-1) as a result of the cataclysm.

  Ensure the outcome is significantly affected by the preparation level, with higher preparation leading to better outcomes.
  Consider the specific challenges posed by the cataclysm type and how the race's preparations mitigate or exacerbate these challenges.

  Format the response as follows:
  Event Description: [description of the event]
  Outcome Description: [description of the long-term outcome]
  Race Survival Rate: [survival rate as a decimal between 0 and 1]
  Infrastructure Damage: [infrastructure damage as a decimal between 0 and 1]`,
});

const simulateCataclysmEventFlow = ai.defineFlow(
  {
    name: 'simulateCataclysmEventFlow',
    inputSchema: SimulateCataclysmEventInputSchema,
    outputSchema: SimulateCataclysmEventOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
